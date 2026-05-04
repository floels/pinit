output "cluster_name" {
  value = module.eks.cluster_name
}

output "ecr_api_repository_url" {
  value = module.ecr_api.repository_url
}

output "rds_address" {
  value = module.rds.address
}

output "cloudfront_distribution_id" {
  value = module.frontend.cloudfront_distribution_id
}

output "cloudfront_domain_name" {
  value = module.frontend.cloudfront_domain_name
}

output "frontend_bucket_name" {
  value = module.frontend.bucket_name
}

output "pins_bucket_name" {
  value = module.s3_pins.bucket_name
}

output "backend_cloudfront_domain_name" {
  value = var.backend_alb_hostname != "" ? aws_cloudfront_distribution.backend[0].domain_name : null
}
