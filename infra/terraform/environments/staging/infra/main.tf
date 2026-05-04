terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

module "vpc" {
  source = "../../../modules/vpc"

  environment        = "staging"
  availability_zones = ["${var.aws_region}a", "${var.aws_region}b"]
}

module "eks" {
  source = "../../../modules/eks"

  cluster_name       = "pinit-staging"
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
}

module "ecr_api" {
  source = "../../../modules/ecr"
  name   = "pinit-api"
}

module "rds" {
  source = "../../../modules/rds"

  environment                = "staging"
  identifier                 = "pinit-staging"
  db_name                    = "pinit_staging"
  db_username                = var.db_username
  db_password                = var.db_password
  vpc_id                     = module.vpc.vpc_id
  subnet_ids                 = module.vpc.private_subnet_ids
  allowed_security_group_ids = [module.eks.node_security_group_id]
}

module "s3_pins" {
  source      = "../../../modules/s3"
  bucket_name = "pinit-staging-pins"
  environment = "staging"
}

module "frontend" {
  source      = "../../../modules/frontend"
  bucket_name = "pinit-staging-frontend"
  environment = "staging"
}

resource "aws_cloudfront_distribution" "backend" {
  count   = var.backend_alb_hostname != "" ? 1 : 0
  enabled = true
  comment = "pinit-staging backend API"

  origin {
    domain_name = var.backend_alb_hostname
    origin_id   = "backend-alb"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    target_origin_id       = "backend-alb"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]

    # CachingDisabled — APIs must not be cached
    cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
    # AllViewerExceptHostHeader — forwards everything except Host so ALB routing works
    origin_request_policy_id = "b689b0a8-53d0-40ab-baf2-68738e2966ac"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Environment = "staging"
  }
}
