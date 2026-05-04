terraform {
  backend "s3" {
    # Run `aws s3 mb s3://pinit-terraform-state --region eu-west-3`
    # before the first `terraform init`.
    bucket         = "pinit-terraform-state"
    key            = "staging/infra/terraform.tfstate"
    region         = "eu-west-3"
    use_lockfile = true
    encrypt        = true
  }
}
