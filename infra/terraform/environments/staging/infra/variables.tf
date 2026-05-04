variable "aws_region" {
  type    = string
  default = "eu-west-3"
}

variable "db_username" {
  type      = string
  sensitive = true
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "backend_alb_hostname" {
  type        = string
  description = "Hostname of the ALB created by the AWS Load Balancer Controller for the backend Ingress. Set after the first ArgoCD sync to provision the CloudFront distribution."
  default     = ""
}
