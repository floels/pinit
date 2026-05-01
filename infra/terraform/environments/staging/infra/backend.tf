terraform {
  backend "s3" {
    # Run `aws s3 mb s3://pinit-terraform-state --region eu-north-1` and
    # `aws dynamodb create-table --table-name pinit-terraform-locks \
    #   --attribute-definitions AttributeName=LockID,AttributeType=S \
    #   --key-schema AttributeName=LockID,KeyType=HASH \
    #   --billing-mode PAY_PER_REQUEST --region eu-north-1`
    # before the first `terraform init`.
    bucket         = "pinit-terraform-state"
    key            = "staging/infra/terraform.tfstate"
    region         = "eu-north-1"
    dynamodb_table = "pinit-terraform-locks"
    encrypt        = true
  }
}
