# Infrastructure

This folder contains everything needed to deploy PinIt to AWS: Terraform modules that provision
the cloud resources, Kubernetes manifests that declare what runs on the cluster, and the ArgoCD
configuration that keeps the cluster in sync with this repo.

---

## Table of contents

1. [Architecture overview](#architecture-overview)
2. [Folder structure](#folder-structure)
3. [AWS resources](#aws-resources)
4. [Terraform: two-phase design](#terraform-two-phase-design)
5. [Kubernetes manifests and Kustomize](#kubernetes-manifests-and-kustomize)
6. [Secrets management](#secrets-management)
7. [Continuous deployment flow](#continuous-deployment-flow)
8. [First-time bootstrap](#first-time-bootstrap)
9. [Day-to-day operations](#day-to-day-operations)

---

## Architecture overview

```
┌─────────────────────────────────────────────────────────┐
│  GitHub                                                  │
│  ┌────────────────────────────────────────────────────┐  │
│  │  push to main                                      │  │
│  │      │                                             │  │
│  │      ▼                                             │  │
│  │  GitHub Actions (deploy-staging.yml)               │  │
│  │  ┌─────────────────┐  ┌────────────────────────┐  │  │
│  │  │  deploy-backend  │  │   deploy-frontend       │  │
│  │  │                 │  │                         │  │
│  │  │ docker build    │  │ pnpm build              │  │
│  │  │ docker push ECR │  │ aws s3 sync             │  │
│  │  │ kustomize edit  │  │ cloudfront invalidation │  │
│  │  │ git commit+push │  └───────────┬─────────────┘  │
│  │  └────────┬────────┘              │                 │  │
│  └───────────┼───────────────────────┼─────────────────┘  │
└─────────────┼───────────────────────┼─────────────────────┘
              │ image tag              │ static assets
              │ commit to repo         │
              ▼                        ▼
┌─────────────────────┐    ┌──────────────────────┐
│  ECR (pinit-api)    │    │  S3 (frontend bucket)│
└─────────────────────┘    └──────────┬───────────┘
                                       │
                            ┌──────────▼───────────┐
                            │  CloudFront           │
                            └──────────────────────┘

              ArgoCD detects the tag commit
              ▼
┌─────────────────────────────────────────────────────────┐
│  EKS cluster (pinit-staging)                            │
│                                                         │
│  namespace: pinit-staging                               │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Deployment (backend, 2 replicas)                 │  │
│  │  ┌──────────────────────────────────────────────┐ │  │
│  │  │  init container: python manage.py migrate    │ │  │
│  │  │  main container: gunicorn (port 80)          │ │  │
│  │  └──────────────────────────────────────────────┘ │  │
│  │                                                   │  │
│  │  Service (ClusterIP :80)                          │  │
│  │  Ingress → ALB (internet-facing)                  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  system components (kube-system / dedicated namespaces) │
│  • AWS Load Balancer Controller  (manages the ALB)      │
│  • External Secrets Operator     (syncs Secrets Manager)│
│  • ArgoCD                        (GitOps controller)    │
└─────────────────────────────────────────────────────────┘
              │
              │  private subnets
              ▼
┌─────────────────────────────────────────────────────────┐
│  RDS PostgreSQL (pinit-staging)                         │
└─────────────────────────────────────────────────────────┘

              S3 (pinit-staging-pins)  ← pin image uploads
```

**Key design choices:**

- **Frontend on S3 + CloudFront** — the Vite build produces static assets; there is no reason to run them in a container. CloudFront caches globally and handles HTTPS.
- **Backend on EKS** — the Django API is containerised (existing `Dockerfile.staging`). EKS provides rolling deployments, health-check-driven restarts, and horizontal scaling without managing EC2 instances directly.
- **Database and object storage outside the cluster** — RDS and S3 are managed AWS services. Running stateful workloads inside Kubernetes adds operational complexity for no benefit at this scale.
- **GitOps via ArgoCD** — the cluster state is always derived from what is committed to `infra/k8s/`. ArgoCD continuously reconciles any drift. A deployment is a Git commit, not an imperative `kubectl apply`.

---

## Folder structure

```
infra/
├── terraform/
│   ├── modules/               # Reusable, parameterised Terraform modules
│   │   ├── vpc/               # VPC with public + private subnets, NAT gateway
│   │   ├── eks/               # EKS cluster + managed node group + OIDC provider
│   │   ├── ecr/               # ECR repository with lifecycle policy
│   │   ├── rds/               # RDS PostgreSQL instance + subnet group + SG
│   │   ├── s3/                # S3 bucket for object storage (pins)
│   │   └── frontend/          # S3 bucket + CloudFront distribution for the SPA
│   └── environments/
│       └── staging/
│           ├── infra/         # Phase 1: provisions cluster and data resources
│           └── platform/      # Phase 2: installs Helm charts into the cluster
│               └── policies/  # IAM policy JSON for the AWS Load Balancer Controller
└── k8s/
    ├── base/
    │   └── backend/           # Environment-agnostic K8s manifests (Deployment, Service, Ingress)
    ├── overlays/
    │   └── staging/           # Staging-specific patches (namespace, image tag, ExternalSecret)
    └── argocd/
        └── apps/              # ArgoCD Application manifests
```

Each Terraform module exposes `variables.tf` (inputs) and `outputs.tf` (outputs) and contains no
environment-specific values — those live exclusively in `environments/`.

---

## AWS resources

### VPC (`modules/vpc`)

A dedicated VPC (`10.0.0.0/16`) with two availability zones. Each AZ gets one public subnet (for
the Application Load Balancer) and one private subnet (for EKS nodes and RDS). A single NAT
gateway in the first public subnet allows private-subnet resources to reach the internet for image
pulls and package updates, without being directly reachable from outside.

The public subnets carry the tag `kubernetes.io/role/elb` and the private subnets carry
`kubernetes.io/role/internal-elb`. These tags are required by the AWS Load Balancer Controller to
know which subnets to place load balancers in.

### EKS cluster (`modules/eks`)

An EKS 1.30 cluster backed by a managed node group of `t3.medium` instances (2 vCPU / 4 GB RAM),
sized between 1 and 3 nodes. Managed node groups handle OS patching and node replacement
automatically.

The module enables the **OIDC provider** for the cluster. This is what makes IRSA (IAM Roles for
Service Accounts) possible: pods can assume IAM roles directly, without static access keys being
stored anywhere. The `platform/` phase uses this to grant the AWS Load Balancer Controller and the
External Secrets Operator the minimum IAM permissions they need.

### ECR repository (`modules/ecr`)

A private container registry (`pinit-api`) in the same region as the cluster. An ECR lifecycle
policy retains the 10 most recent images and expires older ones automatically. GitHub Actions
pushes to this repository on every deploy.

### RDS (`modules/rds`)

A `db.t3.micro` PostgreSQL 17 instance in the private subnets, accessible only from within the
cluster's security group. `multi_az = false` and `skip_final_snapshot = true` are set for staging
to keep costs low.

### S3 pins bucket (`modules/s3`)

A private S3 bucket (`pinit-staging-pins`) that stores user-uploaded pin images. CORS is
configured to allow PUT requests from the frontend origin. Public access is fully blocked; the
Django backend generates pre-signed URLs for client-side uploads.

### Frontend hosting (`modules/frontend`)

A private S3 bucket (`pinit-staging-frontend`) combined with a CloudFront distribution. CloudFront
accesses the bucket via **Origin Access Control** (OAC) — the bucket itself has no public access.
All HTTP traffic is redirected to HTTPS by the distribution. A custom 404 error response returns
`index.html` with a 200 status, which is necessary for React Router to handle client-side routing
correctly.

---

## Terraform: two-phase design

Terraform providers (Helm, Kubernetes) must be initialised before any `apply` runs. They require
the EKS cluster endpoint and CA certificate to establish a connection — but those values only exist
after the cluster has been created. Running both the cluster creation and Helm chart installation in
a single Terraform root module causes a bootstrapping failure on the first apply.

The solution is to split into two independent root modules that share state via data sources:

### Phase 1 — `environments/staging/infra/`

Provisions all AWS infrastructure:

| Resource | Description |
|---|---|
| VPC + subnets + NAT | Network layer |
| EKS cluster + node group | Compute layer |
| ECR repository | Container registry |
| RDS PostgreSQL | Database |
| S3 pins bucket | Object storage |
| S3 frontend bucket + CloudFront | Frontend hosting |

State is stored in S3 at `s3://pinit-terraform-state/staging/infra/terraform.tfstate`.

### Phase 2 — `environments/staging/platform/`

Reads the cluster details from AWS data sources (no dependency on phase 1 state), then installs
Helm charts into the running cluster:

| Component | Namespace | Purpose |
|---|---|---|
| AWS Load Balancer Controller | `kube-system` | Creates and manages ALBs from `Ingress` resources |
| External Secrets Operator | `external-secrets` | Syncs AWS Secrets Manager secrets into K8s `Secret` objects |
| ArgoCD | `argocd` | GitOps controller — syncs the cluster to `infra/k8s/` |

Each component that needs AWS access gets its own IAM role via IRSA. The role's trust policy
allows only the specific Kubernetes service account of that component to assume it (scoped by
namespace and service account name). This includes the backend pod itself, which needs
`s3:PutObject` to sign presigned upload URLs — no static S3 credentials are stored anywhere.

State is stored at `s3://pinit-terraform-state/staging/platform/terraform.tfstate`.

---

## Kubernetes manifests and Kustomize

The manifests use **Kustomize**, which is built into `kubectl`. Kustomize has a `base/` layer
containing environment-agnostic resources, and an `overlays/` layer per environment that patches or
extends the base.

### `base/backend/`

- **`deployment.yaml`** — Declares a 2-replica Deployment. An **init container** runs
  `python manage.py migrate` before the main gunicorn container starts. This ensures migrations are
  always applied before new code is served, without requiring a separate CI step. Environment
  variables are injected from the `backend-secrets` Kubernetes Secret (populated by ESO, see below).
- **`service.yaml`** — A ClusterIP Service that routes traffic to pods on port 80.
- **`ingress.yaml`** — An `Ingress` resource annotated for the AWS Load Balancer Controller. The
  annotations `alb.ingress.kubernetes.io/scheme: internet-facing` and
  `alb.ingress.kubernetes.io/target-type: ip` instruct the controller to create a public-facing ALB
  that routes directly to pod IPs (not node ports).

### `overlays/staging/`

- **`namespace.yaml`** — Creates the `pinit-staging` namespace.
- **`externalsecret.yaml`** — Defines two ESO resources: a `ClusterSecretStore` (tells ESO to use
  AWS Secrets Manager in `eu-west-3`) and an `ExternalSecret` (instructs ESO to fetch
  `pinit/staging/backend` from Secrets Manager and create a Kubernetes `Secret` named
  `backend-secrets` in the `pinit-staging` namespace).
- **`kustomization.yaml`** — Applies the `pinit-staging` namespace to all resources, includes the
  above files, and declares the backend image with its current tag. **This file is the only one
  modified by the CD pipeline** — GitHub Actions calls `kustomize edit set image` to update the
  tag, then commits the result.

### `argocd/apps/backend-staging.yaml`

An ArgoCD `Application` resource that tells ArgoCD:
- where to find the manifests: `infra/k8s/overlays/staging/` in this repo, on `HEAD`
- where to deploy them: the `pinit-staging` namespace on the local cluster
- sync policy: automated, with pruning (resources removed from Git are deleted from the cluster)
  and self-healing (manual cluster changes are reverted)

---

## Secrets management

Application secrets (database credentials, Django secret key) are stored in **AWS Secrets Manager**
under the path `pinit/staging/backend`. They are never stored in this repository or in GitHub
secrets.

The flow from Secrets Manager to running containers:

```
AWS Secrets Manager
  pinit/staging/backend  (JSON object with all keys)
        │
        │  External Secrets Operator polls every 1h
        ▼
Kubernetes Secret: backend-secrets (namespace: pinit-staging)
        │
        │  envFrom: secretRef in the pod spec
        ▼
Environment variables in the backend container
```

**IRSA** (IAM Roles for Service Accounts) is used throughout so that no static AWS credentials are
stored anywhere. Two components have IRSA roles:

- **External Secrets Operator** — its service account assumes a role with
  `secretsmanager:GetSecretValue` and `secretsmanager:DescribeSecret` on
  `arn:aws:secretsmanager:eu-west-3:*:secret:pinit/staging/*`.
- **Backend pod** — its service account assumes a role with `s3:PutObject` on
  `arn:aws:s3:::pinit-staging-pins/*`, which is the only permission needed to sign presigned upload
  URLs for client-side pin image uploads.

In both cases the cluster's OIDC provider allows only the specific service account (scoped by
namespace and name) to assume the role via a web identity token.

The secret must be created manually once, before the first deploy:

```bash
aws secretsmanager create-secret \
  --name pinit/staging/backend \
  --region eu-west-3 \
  --secret-string '{
    "DJANGO_SECRET_KEY": "...",
    "POSTGRES_HOST": "<rds-address from terraform output>",
    "POSTGRES_DB": "pinit_staging",
    "POSTGRES_USER": "...",
    "POSTGRES_PASSWORD": "...",
    "S3_PINS_BUCKET_NAME": "pinit-staging-pins",
    "S3_PINS_BUCKET_REGION": "eu-west-3"
  }'
```

---

## Continuous deployment flow

Every push to `main` (excluding automated image-tag commits, filtered by `paths-ignore`) triggers
`.github/workflows/deploy-staging.yml`, which runs two parallel jobs:

### `deploy-backend`

1. **Build** — `docker build` using `backend/Dockerfile.staging`, tagged with the commit SHA.
2. **Push** — Image is pushed to ECR as `<account>.dkr.ecr.eu-west-3.amazonaws.com/pinit-api:<sha>`.
3. **Update manifest** — `kustomize edit set image` rewrites the `images[].newTag` field in
   `infra/k8s/overlays/staging/kustomization.yaml` to the new SHA.
4. **Commit and push** — The manifest change is committed to `main` as
   `ci: deploy backend <sha> to staging`.
5. **ArgoCD reconciles** — ArgoCD detects the new commit within its polling interval (default: 3
   minutes), computes a diff, and performs a rolling deployment. Pods are replaced one by one;
   each new pod runs migrations via its init container before gunicorn starts.

The `paths-ignore` trigger filter prevents the automated tag commit from firing the workflow again,
which would otherwise cause an infinite loop.

### `deploy-frontend`

1. **Build** — `pnpm build` in `frontend/`, with `ENVIRONMENT=staging` and `BACKEND_URL` injected
   at build time via Vite's `define`. These become compile-time constants in the bundle.
2. **Sync to S3** — `aws s3 sync frontend/dist s3://pinit-staging-frontend --delete` uploads the
   new build and removes any files that no longer exist.
3. **Invalidate CloudFront** — Forces CloudFront edge nodes to fetch the new assets on the next
   request, rather than serving the previously cached version.

### Required GitHub secrets (staging environment)

| Secret | Description |
|---|---|
| `DEPLOYMENT_AWS_ACCESS_KEY_ID` | IAM user with ECR push, S3 sync, and CloudFront invalidation permissions |
| `DEPLOYMENT_AWS_SECRET_ACCESS_KEY` | Corresponding secret key |
| `STAGING_BACKEND_URL` | Full HTTPS URL of the backend CloudFront distribution **including the `/api` path prefix** (e.g. `https://xxxx.cloudfront.net/api`) — injected into the frontend bundle at build time. Available via `terraform output backend_cloudfront_domain_name` after step 7.5. |
| `STAGING_CLOUDFRONT_DISTRIBUTION_ID` | Available via `terraform output cloudfront_distribution_id` after phase 1 |

---

## First-time bootstrap

Run these steps once to go from zero to a live staging environment.

### Prerequisites

- AWS CLI configured with an IAM user that has broad permissions (AdministratorAccess is simplest
  for initial setup; tighten afterwards)
- `terraform` >= 1.0
- `kubectl`
- `docker` (for the initial image push)
- `kustomize`

### Step 1 — Create Terraform remote state bucket

```bash
aws s3 mb s3://pinit-terraform-state --region eu-west-3
```

State locking uses S3's native locking (`use_lockfile = true`) — no DynamoDB table needed.

### Step 2 — Apply phase 1 (infrastructure)

```bash
cd infra/terraform/environments/staging/infra

terraform init

# Pass DB credentials via env vars (not committed to the repo).
# Use single quotes if your password contains special characters (e.g. $ # !)
# to prevent shell expansion.
export TF_VAR_db_username=pinit
export TF_VAR_db_password='<choose a strong password>'
```

Apply in three passes to avoid a bootstrapping race condition where the EKS
node group is created before the VPC's NAT gateway exists (nodes in private
subnets need the NAT gateway to reach the EKS API and join the cluster):

```bash
# 1. Create VPC (public/private subnets, internet gateway, NAT gateway)
terraform apply -target=module.vpc

# 2. Create EKS cluster and node group (nodes can now reach the API via NAT)
terraform apply -target=module.eks

# 3. Create everything else (RDS, S3, ECR, CloudFront)
terraform apply
```

Note the outputs — you will need `rds_address` for the Secrets Manager secret and
`cloudfront_distribution_id` for the GitHub secret.

### Step 3 — Create the Secrets Manager secret

Use the values from the Terraform outputs and your chosen credentials:

```bash
aws secretsmanager create-secret \
  --name pinit/staging/backend \
  --region eu-west-3 \
  --secret-string '{
    "DJANGO_SECRET_KEY": "<generate with: python -c \"from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())\">",
    "POSTGRES_HOST": "<rds_address output from step 2>",
    "POSTGRES_DB": "pinit_staging",
    "POSTGRES_USER": "pinit",
    "POSTGRES_PASSWORD": "<same password as TF_VAR_db_password>",
    "S3_PINS_BUCKET_NAME": "pinit-staging-pins",
    "S3_PINS_BUCKET_REGION": "eu-west-3"
  }'
```

S3 access for the backend is handled via IRSA — no static S3 credentials are needed here.

### Step 4 — Configure kubectl

```bash
aws eks update-kubeconfig --name pinit-staging --region eu-west-3
```

### Step 5 — Apply phase 2 (platform)

```bash
cd infra/terraform/environments/staging/platform
terraform init
terraform apply
```

This installs ArgoCD, the AWS Load Balancer Controller and the External Secrets Operator.

If the apply fails with a webhook error (`no endpoints available for service
"aws-load-balancer-webhook-service"`), the Load Balancer Controller pods weren't ready in time.
Wait ~30 seconds, then re-run `terraform apply` — it will pick up where it left off.

### Step 6 — Register the GitHub repo with ArgoCD

ArgoCD needs read access to pull manifests from the repo. Create a GitHub personal access token
with `public_repo` scope (or `repo` for a private repo), then register the repo as a Kubernetes
secret in the `argocd` namespace:

```bash
kubectl apply -n argocd -f - <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: pinit-repo
  namespace: argocd
  labels:
    argocd.argoproj.io/secret-type: repository
stringData:
  type: git
  url: https://github.com/floels/pinit
  username: <github-username>
  password: <personal-access-token>
EOF
```

### Step 6.5 — Push the initial Docker image to ECR

The first ArgoCD sync happens before CI has run, so you need to push an initial image manually.
On Apple Silicon Macs, add `--platform linux/amd64` — EKS nodes are x86_64.

```bash
# From the repo root
aws ecr get-login-password --region eu-west-3 | \
  docker login --username AWS --password-stdin \
  <aws-account-id>.dkr.ecr.eu-west-3.amazonaws.com

docker build --platform linux/amd64 \
  -f backend/Dockerfile.staging -t pinit-api backend/

docker tag pinit-api:latest \
  <aws-account-id>.dkr.ecr.eu-west-3.amazonaws.com/pinit-api:latest

docker push <aws-account-id>.dkr.ecr.eu-west-3.amazonaws.com/pinit-api:latest
```

`infra/k8s/overlays/staging/kustomization.yaml` pins a specific image SHA from the last CI run.
ArgoCD will try to pull that exact tag, so you must also push the image under that SHA:

```bash
PINNED_TAG=$(grep newTag infra/k8s/overlays/staging/kustomization.yaml | awk '{print $2}')

docker tag pinit-api:latest \
  <aws-account-id>.dkr.ecr.eu-west-3.amazonaws.com/pinit-api:$PINNED_TAG

docker push <aws-account-id>.dkr.ecr.eu-west-3.amazonaws.com/pinit-api:$PINNED_TAG
```

### Step 7 — Apply the ArgoCD Application

```bash
kubectl apply -f infra/k8s/argocd/apps/backend-staging.yaml
```

ArgoCD will immediately sync `infra/k8s/overlays/staging/` and bring up the backend Deployment.

### Step 7.5 — Provision the backend CloudFront distribution

The backend ALB only serves HTTP. To expose the API over HTTPS (required because the frontend is
served over HTTPS and browsers block mixed content), a CloudFront distribution is placed in front
of it. CloudFront terminates TLS and proxies requests to the ALB over HTTP internally.

This step runs after the first ArgoCD sync because the ALB hostname isn't known until the AWS Load
Balancer Controller processes the Ingress. Get the hostname from the Ingress:

```bash
kubectl get ingress backend -n pinit-staging \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

Then apply the distribution:

```bash
cd infra/terraform/environments/staging/infra
TF_VAR_db_username=pinit TF_VAR_db_password='<your password>' \
  terraform apply \
  -var="backend_alb_hostname=<hostname from above>" \
  -target=aws_cloudfront_distribution.backend
```

Note the `backend_cloudfront_domain_name` output — you will need it for the `STAGING_BACKEND_URL`
GitHub secret in step 9. Remember to append `/api` to the domain name when setting that secret.

### Step 8 — Create the CI/CD IAM user

GitHub Actions needs an IAM user to push images to ECR, sync the frontend to S3, and invalidate
CloudFront. Create it in the AWS Console (no console access needed) with the following inline
policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload",
        "ecr:PutImage"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::pinit-staging-frontend",
        "arn:aws:s3:::pinit-staging-frontend/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": "cloudfront:CreateInvalidation",
      "Resource": "*"
    }
  ]
}
```

Then generate an access key for that user — you will need it in the next step.

### Step 9 — Set GitHub secrets

In the GitHub repository settings under **Environments → staging**, add the four secrets listed in
the [Required GitHub secrets](#required-github-secrets-staging-environment) section.

### Step 10 — Deploy the frontend for the first time

The frontend S3 bucket is empty until CI runs. Build and sync it manually once:

```bash
# From the repo root
cd frontend
ENVIRONMENT=staging BACKEND_URL=<STAGING_BACKEND_URL> pnpm build

aws s3 sync dist s3://pinit-staging-frontend --delete

aws cloudfront create-invalidation \
  --distribution-id <cloudfront_distribution_id> \
  --paths "/*"
```

Use the same value for `BACKEND_URL` that you set as the `STAGING_BACKEND_URL` GitHub secret
(i.e. `https://<backend-domain>.cloudfront.net/api`). From this point on, every push to `main`
triggers a full deploy automatically.

---

## Day-to-day operations

**Deploying a new version** — push to `main`. The workflow handles everything.

**Checking deploy status** — open the ArgoCD UI (`kubectl port-forward svc/argocd-server -n argocd 8080:443`) and inspect the `backend-staging` Application. Green = synced.

**Rolling back** — revert the image-tag commit in `infra/k8s/overlays/staging/kustomization.yaml`
and push. ArgoCD will reconcile to the previous image.

**Updating a secret** — edit the value in AWS Secrets Manager. ESO will refresh the Kubernetes
Secret within 1 hour (the `refreshInterval` set in `externalsecret.yaml`). For an immediate
refresh: `kubectl annotate externalsecret backend-secrets -n pinit-staging force-sync=$(date +%s) --overwrite`.

**Scaling nodes** — change `node_desired_size` in
`infra/terraform/environments/staging/infra/variables.tf` (or pass it as a `tfvars` override) and
run `terraform apply` in the `infra/` phase.

**Modifying Helm chart versions** — update the `version` field of the relevant `helm_release`
resource in `platform/main.tf` and run `terraform apply` in the `platform/` phase.
