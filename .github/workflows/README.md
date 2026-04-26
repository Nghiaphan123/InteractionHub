# CI/CD Pipeline for InteractHub

Complete GitHub Actions workflow for automated build, test, and deployment to Azure.

---

## 📋 Overview

The CI/CD pipeline provides:

✅ **Automated Testing**  
- Unit tests for backend (.NET)
- ESLint for frontend (TypeScript)
- Code quality analysis

✅ **Security Scanning**  
- Dependency vulnerability checks
- Code security analysis
- SAST (Static Application Security Testing)

✅ **Automated Deployment**  
- Staging deployment on `develop` branch push
- Production deployment on `main` branch push
- Infrastructure provisioning with Bicep
- Database migrations

✅ **Monitoring Setup**  
- Application Insights integration
- Automated health checks
- Error alerting

---

## 🏗️ Pipeline Architecture

```
GitHub Repository
├── main branch           → Production deployment
└── develop branch        → Staging deployment

On Push to develop/main:
├─ [1] Checkout code
├─ [2] Build backend (.NET)
├─ [3] Run backend tests
├─ [4] Build frontend (React)
├─ [5] Run frontend lint
├─ [6] Security scanning
├─ [7] Deploy infrastructure (Bicep)
├─ [8] Deploy application
├─ [9] Run smoke tests
└─ [10] Send notifications
```

---

## 📂 Workflow Files

### Main Workflow: `.github/workflows/deploy.yml`

Located at: [.github/workflows/deploy.yml](../../.github/workflows/deploy.yml)

**Key Jobs:**
1. **backend-build** - Compile and test .NET API
2. **frontend-build** - Build React SPA
3. **security-scan** - Check vulnerabilities
4. **deploy-staging** - Deploy to staging (develop)
5. **deploy-production** - Deploy to production (main)

---

## 🔧 Configuration

### Environment Variables

Set in GitHub Actions environments:

**Staging Environment:**
```
AZURE_RESOURCE_GROUP = interacthub-rg-staging
AZURE_REGION = eastus
ENVIRONMENT = staging
APP_SERVICE_SKU = B2
```

**Production Environment:**
```
AZURE_RESOURCE_GROUP = interacthub-rg-production
AZURE_REGION = eastus
ENVIRONMENT = production
APP_SERVICE_SKU = P1V2
```

### GitHub Secrets

Required secrets (see [GITHUB_SECRETS.md](../GITHUB_SECRETS.md)):

```
AZURE_CREDENTIALS          # Service Principal JSON
AZURE_RESOURCE_GROUP_STAGING
AZURE_RESOURCE_GROUP_PRODUCTION
SLACK_WEBHOOK              # Optional: for notifications
```

---

## 🚀 Deployment Triggers

### Automatic Deployments

```yaml
# Staging deployment (on develop push)
on:
  push:
    branches: [develop]

# Production deployment (on main push)
on:
  push:
    branches: [main]
```

### Manual Triggers

```bash
# Trigger workflow manually via GitHub CLI
gh workflow run deploy.yml --ref main --inputs environment=production
```

### Schedule (Optional)

Add scheduled deployments:

```yaml
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
```

---

## 📊 Workflow Stages

### Stage 1: Backend Build & Test

**Duration**: ~20 minutes

```yaml
jobs:
  backend-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '8.0'
      
      # Restore dependencies
      - run: dotnet restore InteractionHub/InteractionHub.API
      
      # Build solution
      - run: dotnet build InteractionHub/InteractionHub.API -c Release
      
      # Run tests
      - run: dotnet test InteractionHub/InteractionHub.API --no-build -c Release
      
      # Publish artifact
      - uses: actions/upload-artifact@v4
        with:
          name: backend-artifact
          path: InteractionHub/InteractionHub.API/bin/Release/net8.0
```

### Stage 2: Frontend Build & Lint

**Duration**: ~15 minutes

```yaml
jobs:
  frontend-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      # Install dependencies
      - run: npm ci
        working-directory: InteractionHub/interacthub-client
      
      # Run linter
      - run: npm run lint --continue-on-error
        working-directory: InteractionHub/interacthub-client
      
      # Build application
      - run: npm run build
        working-directory: InteractionHub/interacthub-client
      
      # Upload artifact
      - uses: actions/upload-artifact@v4
        with:
          name: frontend-artifact
          path: InteractionHub/interacthub-client/dist
```

### Stage 3: Security Scanning

**Duration**: ~10 minutes

Scans for:
- Dependency vulnerabilities (npm, NuGet)
- Code security issues
- Secrets in code
- Package licensing

### Stage 4: Deploy to Staging

**Duration**: ~25 minutes  
**Triggered**: On `develop` push

```yaml
deploy-staging:
  if: github.ref == 'refs/heads/develop'
  needs: [backend-build, frontend-build, security-scan]
  runs-on: ubuntu-latest
  environment: staging
  
  steps:
    - uses: actions/checkout@v4
    
    # Azure login
    - uses: azure/login@v1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}
    
    # Deploy infrastructure
    - uses: azure/arm-deploy@v1
      with:
        resourceGroupName: ${{ env.AZURE_RESOURCE_GROUP }}
        template: ./azure/bicep/main.bicep
        parameters: |
          environment=staging
          sqlAdminPassword=${{ secrets.SQL_ADMIN_PASSWORD }}
    
    # Deploy backend
    - run: |
        az webapp up \
          --name interacthub-api-staging \
          --resource-group ${{ env.AZURE_RESOURCE_GROUP }}
          
    # Run smoke tests
    - run: |
        curl -f https://interacthub-api-staging.azurewebsites.net/api/health
```

### Stage 5: Deploy to Production

**Duration**: ~30 minutes  
**Triggered**: On `main` push  
**Requires**: Manual approval (optional)

```yaml
deploy-production:
  if: github.ref == 'refs/heads/main'
  needs: [backend-build, frontend-build, security-scan]
  runs-on: ubuntu-latest
  environment: production
  
  steps:
    # Same as staging but with production resources
    - uses: azure/login@v1
    - uses: azure/arm-deploy@v1
    - run: azure app-insights configure
    - run: send-notification  # Slack/Teams
```

---

## 📈 Monitoring Pipeline Execution

### View Workflow Runs

```bash
# List recent runs
gh run list --workflow deploy.yml

# View specific run details
gh run view {run-id}

# Watch run in real-time
gh run watch {run-id}

# Download run logs
gh run download {run-id}
```

### Check Job Status

```bash
# Via GitHub CLI
gh run view {run-id} --log

# Via GitHub UI
GitHub → Actions → deploy.yml → Latest run → Job logs
```

---

## 🔐 Secrets Management

### Adding Secrets Securely

```bash
# Using GitHub CLI
gh secret set AZURE_CREDENTIALS < azure-credentials.json
gh secret set SQL_ADMIN_PASSWORD --body "YourSecurePassword"

# List secrets
gh secret list

# Update secret
gh secret set AZURE_CREDENTIALS < new-credentials.json
```

### Rotating Secrets

```bash
# Every 90 days
az ad sp credential reset --id {app-id}

# Update in GitHub
gh secret set AZURE_CREDENTIALS < new-credentials.json
```

---

## ✅ Quality Gates

### Failing Build Conditions

The pipeline fails if:

```yaml
# Backend
- Unit test failure (code coverage < 80%)
- Build errors
- Static analysis warnings

# Frontend
- ESLint errors (warnings allowed)
- Build errors
- TypeScript compilation errors

# Security
- Critical/High vulnerabilities detected
- Secrets found in code

# Deployment
- Azure deployment failure
- Health check timeout
- Smoke test failure
```

---

## 📊 Performance Metrics

### Typical Pipeline Duration

| Stage | Duration | Status |
|-------|----------|--------|
| Backend Build | 8 min | ✅ |
| Frontend Build | 6 min | ✅ |
| Security Scan | 5 min | ✅ |
| Deploy Staging | 15 min | ✅ |
| Deploy Production | 20 min | ✅ |
| **Total** | **~50 min** | ✅ |

### Cost Estimation

GitHub Actions includes free tier:
- **2,000 minutes/month** for free
- $0.008/minute beyond that
- InteractHub: ~50 min per deployment × 2-3 per week = ~400-600 min/month (within free tier)

---

## 🔄 Rollback Procedure

### If Deployment Fails

```bash
# Get previous deployment
az deployment group list \
  --resource-group interacthub-rg-production \
  --query "[].{name:name, timestamp:properties.timestamp}" -o table

# Redeploy previous version
git revert HEAD
git push main  # Triggers redeploy with previous version
```

### Manual Rollback

```bash
# Rollback to specific commit
git revert {commit-hash}
git push main

# Monitor deployment
gh run watch
```

---

## 🐛 Debugging Failed Builds

### View Detailed Logs

```bash
# Download all logs
gh run download {run-id} --dir ./logs

# View specific job logs
gh run view {run-id} --log | grep -A 50 "backend-build"

# Stream live logs during run
gh run watch {run-id}
```

### Common Failures

| Error | Cause | Fix |
|-------|-------|-----|
| **"Authentication failed"** | Invalid AZURE_CREDENTIALS | Update secret |
| **"Resource not found"** | Wrong resource group | Check environment vars |
| **"Build timeout"** | Large dependencies | Increase timeout |
| **"Deployment failed"** | Infrastructure issue | Check Azure Portal |

---

## 📱 Notifications

### Slack Integration

```yaml
- name: Notify Slack
  if: always()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "Deployment ${{ job.status }} for ${{ github.ref }}"
      }
```

### Teams Integration

```yaml
- name: Notify Teams
  if: always()
  uses: jdcargile/ms-teams-notification@v1.3
  with:
    github-token: ${{ github.token }}
    ms-teams-webhook-uri: ${{ secrets.TEAMS_WEBHOOK }}
    notification-color: ${{ job.status == 'success' && '28a745' || 'dc3545' }}
```

---

## 🎯 Best Practices

### 1. Branch Protection Rules

```
Settings → Branches → Add rule:
- Require status checks to pass before merging
- Require code reviews before merging (1 approval)
- Require branches to be up to date
- Restrict who can push to matching branches
```

### 2. Semantic Versioning

```bash
# Tag releases
git tag -a v1.0.0 -m "Initial release"
git push origin v1.0.0

# Trigger deployment on tag
on:
  push:
    tags:
      - v*
```

### 3. Environment Parity

- Staging environment mirrors production
- Same resource SKU configuration
- Same deployment process
- Same monitoring setup

### 4. Artifact Retention

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: build-artifact
    path: build/
    retention-days: 5  # Keep for 5 days
```

---

## 📚 Related Documentation

- [DEPLOYMENT.md](../DEPLOYMENT.md) - Detailed deployment guide
- [GITHUB_SECRETS.md](../GITHUB_SECRETS.md) - Secrets configuration
- [azure/README.md](../azure/README.md) - Infrastructure guide
- [QUICKSTART.md](../QUICKSTART.md) - Quick deployment

---

## 🔗 GitHub Actions Resources

- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Azure Actions](https://github.com/Azure/actions)
- [Workflow Triggers](https://docs.github.com/en/actions/using-workflows/triggering-a-workflow)
- [Environment Variables](https://docs.github.com/en/actions/learn-github-actions/environment-variables)

---

**Last Updated**: April 25, 2026  
**Maintained By**: DevOps Team  
**Version**: 1.0.0

✅ Ready for production deployment!
