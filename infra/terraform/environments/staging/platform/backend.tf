terraform {
  backend "s3" {
    bucket         = "pinit-terraform-state"
    key            = "staging/platform/terraform.tfstate"
    region         = "eu-west-3"
    use_lockfile = true
    encrypt        = true
  }
}
