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
  allowed_security_group_ids = [module.eks.cluster_security_group_id]
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
