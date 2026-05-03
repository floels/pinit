variable "aws_region" {
  type    = string
  default = "eu-north-1"
}

variable "db_username" {
  type      = string
  sensitive = true
}

variable "db_password" {
  type      = string
  sensitive = true
}
