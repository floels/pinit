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

Each Helm chart that needs AWS access gets its own IAM role via IRSA. The role's trust policy
allows only the specific Kubernetes service account of that component to assume it (scoped by
namespace and service account name).

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
  AWS Secrets Manager in `eu-north-1`) and an `ExternalSecret` (instructs ESO to fetch
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

Application secrets (database credentials, Django secret key, S3 access keys) are stored in **AWS
Secrets Manager** under the path `pinit/staging/backend`. They are never stored in this repository
or in GitHub secrets.

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

**IRSA** (IAM Roles for Service Accounts) is used so that the ESO pod can call Secrets Manager
without any static credentials. The ESO service account is annotated with the ARN of an IAM role
that has `secretsmanager:GetSecretValue` and `secretsmanager:DescribeSecret` on
`arn:aws:secretsmanager:eu-north-1:*:secret:pinit/staging/*`. The cluster's OIDC provider allows
this specific service account to assume this role via a web identity token.

The secret must be created manually once, before the first deploy:

```bash
aws secretsmanager create-secret \
  --name pinit/staging/backend \
  --region eu-north-1 \
  --secret-string '{
    "DJANGO_SECRET_KEY": "...",
    "POSTGRES_HOST": "<rds-address from terraform output>",
    "POSTGRES_DB": "pinit_staging",
    "POSTGRES_USER": "...",
    "POSTGRES_PASSWORD": "...",
    "S3_PINS_BUCKET_NAME": "pinit-staging-pins",
    "S3_PINS_BUCKET_REGION": "eu-north-1",
    "S3_PINS_BUCKET_UPLOADER_ACCESS_KEY_ID": "...",
    "S3_PINS_BUCKET_UPLOADER_SECRET_ACCESS_KEY": "..."
  }'
```

---

## Continuous deployment flow

Every push to `main` (excluding automated image-tag commits, filtered by `paths-ignore`) triggers
`.github/workflows/deploy-staging.yml`, which runs two parallel jobs:

### `deploy-backend`

1. **Build** — `docker build` using `backend/Dockerfile.staging`, tagged with the commit SHA.
2. **Push** — Image is pushed to ECR as `<account>.dkr.ecr.eu-north-1.amazonaws.com/pinit-api:<sha>`.
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
| `STAGING_BACKEND_URL` | Full URL of the ALB (e.g. `http://k8s-...elb.amazonaws.com`) — injected into the frontend bundle at build time |
| `STAGING_CLOUDFRONT_DISTRIBUTION_ID` | Available via `terraform output cloudfront_distribution_id` after phase 1 |

---

## First-time bootstrap

Run these steps once to go from zero to a live staging environment.

### Prerequisites

- AWS CLI configured with an IAM user that has broad permissions (AdministratorAccess is simplest
  for initial setup; tighten afterwards)
- `terraform` >= 1.0
- `kubectl`
- `argocd` CLI
- `kustomize`

### Step 1 — Create Terraform remote state resources

```bash
aws s3 mb s3://pinit-terraform-state --region eu-north-1

aws dynamodb create-table \
  --table-name pinit-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region eu-north-1
```

### Step 2 — Apply phase 1 (infrastructure)

```bash
cd infra/terraform/environments/staging/infra

terraform init

# Pass DB credentials via env vars (not committed to the repo)
export TF_VAR_db_username=pinit
export TF_VAR_db_password=<choose a strong password>

terraform apply
```

Note the outputs — you will need `rds_address` for the Secrets Manager secret and
`cloudfront_distribution_id` for the GitHub secret.

### Step 3 — Create the Secrets Manager secret

Use the values from the Terraform outputs and your chosen credentials:

```bash
aws secretsmanager create-secret \
  --name pinit/staging/backend \
  --region eu-north-1 \
  --secret-string '{
    "DJANGO_SECRET_KEY": "<generate with: python -c \"from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())\">"
    "POSTGRES_HOST": "<rds_address output from step 2>",
    "POSTGRES_DB": "pinit_staging",
    "POSTGRES_USER": "pinit",
    "POSTGRES_PASSWORD": "<same password as TF_VAR_db_password>",
    "S3_PINS_BUCKET_NAME": "pinit-staging-pins",
    "S3_PINS_BUCKET_REGION": "eu-north-1",
    "S3_PINS_BUCKET_UPLOADER_ACCESS_KEY_ID": "<IAM access key for S3 uploads>",
    "S3_PINS_BUCKET_UPLOADER_SECRET_ACCESS_KEY": "<corresponding secret key>"
  }'
```

### Step 4 — Configure kubectl

```bash
aws eks update-kubeconfig --name pinit-staging --region eu-north-1
```

### Step 5 — Apply phase 2 (platform)

```bash
cd infra/terraform/environments/staging/platform
terraform init
terraform apply
```

This installs ArgoCD, the AWS Load Balancer Controller and the External Secrets Operator.

### Step 6 — Register the GitHub repo with ArgoCD

ArgoCD needs read access to pull manifests from the repo. Retrieve the initial admin password:

```bash
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d
```

Forward the ArgoCD UI locally:

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Then open `https://localhost:8080`, log in as `admin`, and register the repo under
**Settings → Repositories** (HTTPS with a GitHub personal access token, or SSH).

Alternatively, via the CLI:

```bash
argocd login localhost:8080
argocd repo add https://github.com/floels/pinit.git \
  --username <github-username> \
  --password <personal-access-token>
```

### Step 7 — Apply the ArgoCD Application

```bash
kubectl apply -f infra/k8s/argocd/apps/backend-staging.yaml
```

ArgoCD will immediately sync `infra/k8s/overlays/staging/` and bring up the backend Deployment.

### Step 8 — Set GitHub secrets

In the GitHub repository settings under **Environments → staging**, add the four secrets listed in
the [Required GitHub secrets](#required-github-secrets-staging-environment) section. From this
point on, every push to `main` triggers a full deploy automatically.

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
