terraform {
  backend "s3" {
    bucket         = "pinit-terraform-state"
    key            = "staging/platform/terraform.tfstate"
    region         = "eu-north-1"
    dynamodb_table = "pinit-terraform-locks"
    encrypt        = true
  }
}
