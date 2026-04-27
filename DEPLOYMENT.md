# InteractHub - Azure Deployment & CI/CD Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Deployment Steps](#deployment-steps)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Configuration Management](#configuration-management)
7. [Monitoring & Logging](#monitoring--logging)
8. [Troubleshooting](#troubleshooting)
9. [Cost Optimization](#cost-optimization)

---

## 🏗️ Overview

InteractHub is deployed on **Microsoft Azure** using:
- **App Service**: Backend API (.NET 8)
- **Azure SQL Database**: Production-grade relational database
- **Azure Blob Storage**: Image uploads and media storage
- **Application Insights**: Monitoring and diagnostics
- **Key Vault**: Secure credential management
- **GitHub Actions**: CI/CD automation
- **Static Web Apps**: Frontend (React/TypeScript)

**Deployment Environments:**
- **Staging**: For testing and validation (develop branch)
- **Production**: Live environment (main branch)

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────┐
│              GitHub Repository                      │
│  (main branch → Production | develop → Staging)    │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │   GitHub Actions       │
        │  CI/CD Pipeline        │
        └───────┬────────────────┘
                │
    ┌───────────┴───────────┐
    ▼                       ▼
┌─────────┐            ┌─────────────┐
│  Build  │            │  Security   │
│  Test   │            │  Scan       │
└────┬────┘            └──────┬──────┘
     │                        │
     └───────────┬────────────┘
                 ▼
     ┌───────────────────────┐
     │  Deploy to Staging    │
     │  OR Production        │
     └───────────┬───────────┘
                 │
    ┌────────────┴────────────┐
    ▼                         ▼
┌──────────────┐         ┌──────────────┐
│  App Service │         │ Static Apps  │
│  (Backend)   │         │  (Frontend)  │
└────────┬─────┘         └──────────────┘
         │
    ┌────┴──────┬──────────┬────────────┐
    ▼           ▼          ▼            ▼
┌────────┐  ┌────────┐  ┌──────────┐  ┌─────────┐
│  SQL   │  │ Blob   │  │ Key      │  │ App     │
│  DB    │  │Storage │  │ Vault    │  │Insights │
└────────┘  └────────┘  └──────────┘  └─────────┘
```

---

## 📋 Prerequisites

### Local Machine
```bash
# Required tools
- Azure CLI: https://aka.ms/azure-cli
- .NET 8 SDK: https://dotnet.microsoft.com/download
- Node.js 20+: https://nodejs.org
- Git: https://git-scm.com
- PowerShell 7+ (Windows) or Bash (Linux/Mac)
```

### Azure Account
```bash
# Create Azure account
https://azure.microsoft.com/en-us/free

# Verify access
az account show
```

### GitHub Repository Setup
```bash
# Add Azure credentials as GitHub Secrets
Settings → Secrets and Variables → Actions

Required Secrets:
- AZURE_CREDENTIALS (Service Principal JSON)
- AZURE_STATIC_WEB_APPS_API_TOKEN_STAGING
- AZURE_STATIC_WEB_APPS_API_TOKEN
- SLACK_WEBHOOK (optional, for notifications)
```

---

## 🚀 Deployment Steps

### Step 1: Create Azure Service Principal

```bash
# Create service principal
az ad sp create-for-rbac \
  --name "interacthub-github-actions" \
  --role "Contributor" \
  --scopes "/subscriptions/{subscription-id}"

# Output:
# {
#   "appId": "...",
#   "displayName": "...",
#   "password": "...",
#   "tenant": "..."
# }

# Add this JSON as AZURE_CREDENTIALS secret in GitHub
```

### Step 2: Manual Deployment (for first-time setup)

#### Option A: Using PowerShell (Windows)
```powershell
# Navigate to project directory
cd InteractionHub

# Run deployment script
.\azure\scripts\deploy.ps1 -Environment staging -AzureRegion eastus

# Output will show:
# - App Service URL
# - SQL Server FQDN
# - Storage Account Name
# - Key Vault URL
```

#### Option B: Using Bash (Linux/Mac)
```bash
# Navigate to project directory
cd InteractionHub

# Make script executable
chmod +x azure/scripts/deploy.sh

# Run deployment
./azure/scripts/deploy.sh staging eastus

# Save output for reference
# Deployment info saved to: deployment-output-staging.json
```

### Step 3: Database Migrations

```bash
# Run database migrations
./azure/scripts/migrate-database.sh staging

# Or manually:
cd InteractionHub/InteractHub.API
dotnet ef database update --context AppDbContext
```

### Step 4: Deploy Application Code

```bash
# Deploy backend
az webapp up \
  --name interacthub-api-staging \
  --resource-group interacthub-rg-staging \
  --runtime "DOTNETCORE|8.0"

# Deploy frontend
az staticwebapp create \
  --name interacthub-frontend-staging \
  --resource-group interacthub-rg-staging \
  --source ./InteractionHub/interacthub-client/dist
```

---

## 🔄 CI/CD Pipeline

### Workflow Triggers

The GitHub Actions pipeline automatically runs on:
- **Push to `main`** → Deploy to Production
- **Push to `develop`** → Deploy to Staging
- **Pull Requests** → Run tests only

### Pipeline Stages

```
1. Backend Build & Test (20 min)
   ├─ Restore dependencies
   ├─ Build .NET solution
   ├─ Run unit tests
   └─ Publish test results

2. Frontend Build & Test (15 min)
   ├─ Install npm dependencies
   ├─ Run ESLint
   ├─ Build React app
   └─ Upload artifact

3. Security Scan (10 min)
   ├─ Analyze code for vulnerabilities
   ├─ Check dependencies
   └─ Report security issues

4. Deploy to Staging (25 min) [on develop push]
   ├─ Create Azure resources
   ├─ Deploy backend API
   ├─ Deploy frontend
   └─ Run smoke tests

5. Deploy to Production (30 min) [on main push]
   ├─ Create Azure resources
   ├─ Deploy backend API
   ├─ Deploy frontend
   ├─ Enable monitoring
   └─ Send notifications
```

### View Pipeline Status

```bash
# Check workflow status
gh workflow list
gh workflow view deploy.yml

# View latest run
gh workflow view deploy.yml --ref main
```

---

## ⚙️ Configuration Management

### Environment Variables

#### Staging (.env.staging)
```
ASPNETCORE_ENVIRONMENT=Development
ConnectionStrings__DefaultConnection=Server=tcp:interacthub-sql-xxx.database.windows.net...
CORS_ALLOWED_ORIGINS=https://interacthub-staging.azurewebsites.net,http://localhost:5173
```

#### Production (.env.production)
```
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=Server=tcp:interacthub-sql-xxx.database.windows.net...
CORS_ALLOWED_ORIGINS=https://interacthub.azurewebsites.net
```

### Azure Key Vault Secrets

```bash
# Add secrets to Key Vault
az keyvault secret set \
  --vault-name interacthub-kv-staging \
  --name ConnectionString \
  --value "Server=tcp:...;Password=..."

az keyvault secret set \
  --vault-name interacthub-kv-staging \
  --name JwtKey \
  --value "YourSecureJwtKeyHere"

# Access from App Service
app.config.AddAzureKeyVault(
  new Uri(keyVaultUrl),
  new DefaultAzureCredential()
);
```

---

## 📊 Monitoring & Logging

### Application Insights Dashboard

```bash
# View Application Insights data
az monitor app-insights metrics show \
  --app interacthub-insights-staging \
  --resource-group interacthub-rg-staging

# Common queries:
# - Request rate: pageViews/5m
# - Failed requests: exceptions/5m
# - Performance: performanceCounters/processCpuPercentage
```

### View Logs

```bash
# Stream live logs from App Service
az webapp log tail \
  --resource-group interacthub-rg-staging \
  --name interacthub-api-staging

# Download log files
az webapp log download \
  --resource-group interacthub-rg-staging \
  --name interacthub-api-staging \
  --log-file app-logs.zip
```

### Enable SQL Audit

```bash
# Enable SQL database auditing
az sql server audit-policy update \
  --resource-group interacthub-rg-staging \
  --name interacthub-sql-xxx \
  --state Enabled \
  --actions SUCCESSFUL_DATABASE_AUTHENTICATION_GROUP
```

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### 1. Deployment Fails - Resource Already Exists
```bash
# Solution: Delete and redeploy
az group delete \
  --name interacthub-rg-staging \
  --yes

# Re-run deployment
./azure/scripts/deploy.ps1 -Environment staging
```

#### 2. Application Can't Connect to Database
```bash
# Check SQL firewall rules
az sql server firewall-rule list \
  --resource-group interacthub-rg-staging \
  --server-name interacthub-sql-xxx

# Add App Service IP
az sql server firewall-rule create \
  --resource-group interacthub-rg-staging \
  --server interacthub-sql-xxx \
  --name AllowAppService \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

#### 3. Frontend Not Accessible
```bash
# Check Static Web Apps status
az staticwebapp show \
  --name interacthub-frontend-staging \
  --resource-group interacthub-rg-staging

# Redeploy frontend
az staticwebapp create \
  --name interacthub-frontend-staging \
  --resource-group interacthub-rg-staging \
  --source ./InteractionHub/interacthub-client
```

#### 4. Slow Performance
```bash
# Check App Service metrics
az monitor metrics list \
  --resource /subscriptions/{id}/resourceGroups/interacthub-rg-staging/providers/Microsoft.Web/sites/interacthub-api-staging \
  --metric AverageCpuTime,MemoryUsagePercent

# Scale up if needed
az appservice plan update \
  --name interacthub-plan-staging \
  --resource-group interacthub-rg-staging \
  --sku P1V2
```

---

## 💰 Cost Optimization

### Current Resource Costs (Estimated Monthly)
```
App Service Plan (B2):      ~$50
SQL Database (S0):           ~$15
Blob Storage (1GB):          ~$0.50
Key Vault:                   ~$0.33
Application Insights:        ~$2.29
─────────────────────────────
Total (Staging):           ~$68/month

Production (P1V2 + S2):    ~$150-200/month
```

### Cost Reduction Strategies

```bash
# 1. Use autoscaling for production
az appservice plan update \
  --name interacthub-plan-production \
  --resource-group interacthub-rg-production \
  --sku P1V2

# 2. Enable reserved instances
# Save 30-40% with 1-year or 3-year reservations

# 3. Use managed identity instead of connection strings
# Reduces Key Vault queries

# 4. Archive old Application Insights data
# Retention: 90 days for staging, 1 year for production

# 5. Set up budget alerts
az billing account create-budget \
  --name "InteractHub-Monthly-Budget" \
  --amount 200 \
  --time-period Monthly
```

---

## 📝 Deployment Checklist

### Pre-Deployment
- [ ] Code review completed
- [ ] Unit tests passing (>80% coverage)
- [ ] Security scan completed
- [ ] Environment variables configured
- [ ] Database migrations tested locally
- [ ] API documentation updated

### Staging Deployment
- [ ] Deploy to staging environment
- [ ] Run smoke tests
- [ ] Verify database connectivity
- [ ] Check Application Insights metrics
- [ ] Test all API endpoints
- [ ] Verify frontend loads correctly

### Production Deployment
- [ ] Approve staging deployment
- [ ] Create pre-deployment backup
- [ ] Update production DNS (if needed)
- [ ] Enable CDN caching
- [ ] Verify monitoring/alerts
- [ ] Document deployment timestamp
- [ ] Notify stakeholders

### Post-Deployment
- [ ] Monitor application for 24 hours
- [ ] Review error logs
- [ ] Verify performance metrics
- [ ] Test user-facing features
- [ ] Backup database
- [ ] Update deployment log

---

## 🔐 Security Best Practices

```bash
# 1. Enable HTTPS only
az webapp update \
  --resource-group interacthub-rg-production \
  --name interacthub-api \
  --https-only true

# 2. Set minimum TLS version
az webapp config set \
  --resource-group interacthub-rg-production \
  --name interacthub-api \
  --min-tls-version "1.2"

# 3. Enable Web Application Firewall
az webapp waf-policy create \
  --resource-group interacthub-rg-production \
  --name interacthub-waf

# 4. Rotate secrets regularly
# Run monthly: az keyvault secret set --vault-name ... --value "new-secret"

# 5. Enable managed identity
az webapp identity assign \
  --resource-group interacthub-rg-production \
  --name interacthub-api \
  --identities [system]
```

---

## 📞 Support & Resources

### Documentation Links
- [Azure App Service Docs](https://docs.microsoft.com/azure/app-service)
- [Azure SQL Database Docs](https://docs.microsoft.com/azure/azure-sql)
- [GitHub Actions Docs](https://docs.github.com/actions)
- [Bicep Documentation](https://docs.microsoft.com/azure/azure-resource-manager/bicep)

### Contact & Issues
- **GitHub Issues**: Report deployment issues
- **Azure Support**: For infrastructure problems
- **Team Slack**: #interacthub-deployment channel

---

**Last Updated**: April 25, 2026
**Version**: 1.0.0
