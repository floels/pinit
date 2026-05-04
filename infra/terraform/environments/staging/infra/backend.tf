terraform {
  backend "s3" {
    # Run `aws s3 mb s3://pinit-terraform-state --region eu-west-3` and
    # `aws dynamodb create-table --table-name pinit-terraform-locks \
    #   --attribute-definitions AttributeName=LockID,AttributeType=S \
    #   --key-schema AttributeName=LockID,KeyType=HASH \
    #   --billing-mode PAY_PER_REQUEST --region eu-west-3`
    # before the first `terraform init`.
    bucket         = "pinit-terraform-state"
    key            = "staging/infra/terraform.tfstate"
    region         = "eu-west-3"
    use_lockfile = true
    encrypt        = true
  }
}
