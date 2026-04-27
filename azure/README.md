# Azure Infrastructure as Code for InteractHub

This directory contains all Infrastructure as Code (IaC) templates and deployment scripts for provisioning and managing InteractHub on Microsoft Azure.

---

## 📁 Directory Structure

```
azure/
├── bicep/                          # Bicep Infrastructure Templates
│   ├── main.bicep                 # Main infrastructure template (all resources)
│   └── parameters.bicepparam      # Parameter values for Bicep
├── scripts/                        # Deployment and Management Scripts
│   ├── deploy.ps1                 # PowerShell deployment script
│   ├── deploy.sh                  # Bash deployment script
│   ├── migrate-database.sh         # Database migration script
│   └── teardown.ps1               # Cleanup script (optional)
├── app-config.json                # Application configuration
├── .env.example                   # Environment variables template
└── README.md                       # This file
```

---

## 🏗️ Azure Resources Deployed

The Bicep template (`main.bicep`) provisions the following Azure resources:

### Compute & Hosting
- **App Service Plan** (B2 for staging, P1V2 for production)
- **App Service** (Backend API - .NET 8)

### Database & Storage
- **Azure SQL Server** (Managed SQL Server)
- **Azure SQL Database** (S0 for staging, S2 for production)
- **Azure Blob Storage** (File uploads and media)

### Security & Configuration
- **Azure Key Vault** (Secrets management)
- **Managed Identity** (Service Principal for App Service)

### Monitoring & Logging
- **Application Insights** (Performance monitoring)
- **Log Analytics Workspace** (Centralized logging)

### Networking & Security
- **SQL Firewall Rules** (Allow Azure Services)
- **CORS Configuration** (Cross-origin resource sharing)
- **HTTPS Enforcement** (TLS 1.2 minimum)

---

## 🚀 Quick Deploy

### Prerequisites

```bash
# Ensure you have installed:
- Azure CLI 2.50+
- PowerShell 7+ (Windows) or Bash (Linux/Mac)
- .NET 8 SDK
- Git

# Verify installations:
az version
dotnet --version
node --version
```

### One-Command Deployment

#### Windows (PowerShell):
```powershell
cd InteractionHub
.\azure\scripts\deploy.ps1 -Environment staging -AzureRegion eastus
```

#### Linux/Mac (Bash):
```bash
cd InteractionHub
bash azure/scripts/deploy.sh staging eastus
```

---

## 📋 Detailed Deployment Process

### Step 1: Authenticate with Azure

```bash
# Interactive login
az login

# Or service principal login
az login --service-principal \
  -u $AZURE_CLIENT_ID \
  -p $AZURE_CLIENT_SECRET \
  --tenant $AZURE_TENANT_ID

# Select subscription
az account set --subscription "subscription-id"
```

### Step 2: Create Resource Group

```bash
az group create \
  --name interacthub-rg-staging \
  --location eastus
```

### Step 3: Validate Bicep Template

```bash
az deployment group validate \
  --resource-group interacthub-rg-staging \
  --template-file azure/bicep/main.bicep \
  --parameters \
    environment=staging \
    appName=interacthub \
    sqlAdminPassword="SecurePassword123!"
```

### Step 4: Deploy Infrastructure

```bash
az deployment group create \
  --name interacthub-deployment-001 \
  --resource-group interacthub-rg-staging \
  --template-file azure/bicep/main.bicep \
  --parameters \
    environment=staging \
    appName=interacthub \
    location=eastus \
    sqlAdminPassword="SecurePassword123!"
```

### Step 5: Extract Outputs

```bash
# Get deployment outputs
az deployment group show \
  --resource-group interacthub-rg-staging \
  --name interacthub-deployment-001 \
  --query properties.outputs -o json

# Example outputs:
# {
#   "appServiceUrl": { "value": "https://interacthub-api-staging.azurewebsites.net" },
#   "sqlServerFqdn": { "value": "interacthub-sql-xxx.database.windows.net" },
#   "storageAccountName": { "value": "interacthubstoragestaaging" },
#   "keyVaultUrl": { "value": "https://interacthub-kv-staging.vault.azure.net/" }
# }
```

---

## 🔧 Parameter Configuration

### Using Bicep Parameters File

Edit `azure/bicep/parameters.bicepparam`:

```bicep
using './main.bicep'

param environment = 'staging'
param appName = 'interacthub'
param location = 'eastus'
param appServiceSku = 'B2'
param sqlAdminUsername = 'sqladmin'
param sqlAdminPassword = 'SecurePassword123!'  // Store in Key Vault!
```

Deploy with parameters file:
```bash
az deployment group create \
  --resource-group interacthub-rg-staging \
  --template-file azure/bicep/main.bicep \
  --parameters azure/bicep/parameters.bicepparam
```

### Staging vs Production Parameters

| Parameter | Staging | Production |
|-----------|---------|------------|
| `environment` | staging | production |
| `appServiceSku` | B2 | P1V2 |
| `sqlDatabaseSku` | S0 | S2 |
| `storageRedundancy` | LRS | GRS |
| `enableAutoScale` | false | true |
| `maxInstances` | 1 | 3 |

---

## 💾 Database Migrations

### Automatic Migrations (Recommended)

```bash
# Run via deployment script
bash azure/scripts/migrate-database.sh staging
```

### Manual Migrations

```bash
cd InteractionHub/InteractHub.API

# Ensure environment is set
export ASPNETCORE_ENVIRONMENT=Staging

# Get connection string
CONNECTION_STRING=$(az webapp config connection-string list \
  --resource-group interacthub-rg-staging \
  --name interacthub-api-staging \
  --query "[0].value" -o tsv)

# Run migrations
dotnet ef database update \
  --connection "$CONNECTION_STRING" \
  --context AppDbContext \
  --verbose
```

---

## 🔐 Key Vault Integration

### Store Secrets in Key Vault

```bash
# SQL Connection String
az keyvault secret set \
  --vault-name interacthub-kv-staging \
  --name ConnectionString \
  --value "Server=tcp:...;Password=..."

# JWT Key
az keyvault secret set \
  --vault-name interacthub-kv-staging \
  --name JwtKey \
  --value "$(openssl rand -base64 32)"

# API Keys
az keyvault secret set \
  --vault-name interacthub-kv-staging \
  --name ApiKey \
  --value "your-api-key"
```

### Access Secrets from Application

```csharp
// In Program.cs
var keyVaultUrl = new Uri(configuration["KeyVault:Url"]);
builder.Configuration.AddAzureKeyVault(
    keyVaultUrl,
    new DefaultAzureCredential()
);
```

---

## 📊 Monitoring & Logging

### Application Insights Queries

```bash
# View request rate
az monitor metrics list \
  --resource /subscriptions/{id}/resourceGroups/interacthub-rg-staging/providers/microsoft.insights/components/interacthub-insights-staging \
  --metric RequestsPerSecond

# View exception count
az monitor metrics list \
  --metric ExceptionCount

# Download analytics
az monitor app-insights metrics show \
  --app interacthub-insights-staging \
  --resource-group interacthub-rg-staging \
  --metric pageViews,requests
```

### Enable Logging

```bash
# App Service logs
az webapp log config \
  --resource-group interacthub-rg-staging \
  --name interacthub-api-staging \
  --application-logging true \
  --level verbose \
  --detailed-error-messages true

# Stream logs
az webapp log tail \
  --resource-group interacthub-rg-staging \
  --name interacthub-api-staging

# Download logs
az webapp log download \
  --resource-group interacthub-rg-staging \
  --name interacthub-api-staging \
  --log-file logs.zip
```

---

## 🔄 Scaling & Performance

### Auto-Scaling Configuration

```bash
# Create autoscale setting
az monitor autoscale create \
  --resource-group interacthub-rg-staging \
  --resource-type "Microsoft.Web/serverfarms" \
  --resource-name interacthub-plan-staging \
  --min-count 1 \
  --max-count 3 \
  --count 1

# Add scale-up rule (CPU > 70%)
az monitor autoscale rule create \
  --resource-group interacthub-rg-staging \
  --autoscale-name interacthub-autoscale \
  --metric CpuPercentage \
  --metric-trigger operator GreaterThan \
  --metric-trigger threshold 70 \
  --scale out 1
```

### Manual Scaling

```bash
# Scale up to P1V2 (for production)
az appservice plan update \
  --name interacthub-plan-production \
  --resource-group interacthub-rg-production \
  --sku P1V2

# Increase instance count
az appservice plan update \
  --name interacthub-plan-production \
  --resource-group interacthub-rg-production \
  --number-of-workers 3
```

---

## 🧹 Cleanup & Teardown

### Delete Entire Resource Group

```bash
# Warning: This deletes ALL resources!
az group delete \
  --name interacthub-rg-staging \
  --yes

# Verify deletion
az group show --name interacthub-rg-staging
# Returns: ResourceGroupNotFound
```

### Delete Specific Resources

```bash
# Delete just the app service
az webapp delete \
  --resource-group interacthub-rg-staging \
  --name interacthub-api-staging

# Delete just the database
az sql db delete \
  --resource-group interacthub-rg-staging \
  --server interacthub-sql-xxx \
  --name InteractHub_staging
```

---

## 🚨 Common Issues & Solutions

### Issue: "ResourceNotFound"
```bash
# Resource doesn't exist
az resource show --resource-group interacthub-rg-staging --name interacthub-api-staging --resource-type "Microsoft.Web/sites"

# Check resource group exists
az group show --name interacthub-rg-staging
```

### Issue: "Insufficient quota"
```bash
# Check current quota
az provider show --namespace Microsoft.Web --query "resourceTypes[?resourceType=='sites'].locations" -o table

# Request quota increase via Azure Portal
# Settings → Usage + quotas → Request quota increase
```

### Issue: "Access Denied"
```bash
# Check RBAC permissions
az role assignment list --scope "/subscriptions/$(az account show --query id -o tsv)"

# Add Contributor role if needed
az role assignment create \
  --assignee user@example.com \
  --role "Contributor" \
  --scope "/subscriptions/{subscription-id}"
```

---

## 📚 Additional Resources

### Documentation
- [Bicep Documentation](https://docs.microsoft.com/azure/azure-resource-manager/bicep/)
- [Azure App Service](https://docs.microsoft.com/azure/app-service/)
- [Azure SQL Database](https://docs.microsoft.com/azure/azure-sql/database/)
- [Azure Key Vault](https://docs.microsoft.com/azure/key-vault/)

### Azure CLI Commands
```bash
# List all resources
az resource list --resource-group interacthub-rg-staging -o table

# Show resource details
az resource show --ids /subscriptions/xxx/resourceGroups/xxx/providers/Microsoft.Web/sites/xxx

# View deployment history
az deployment group list --resource-group interacthub-rg-staging --output table

# Get subscription info
az account show --output json
```

---

## 🔗 Related Documentation

- [DEPLOYMENT.md](../DEPLOYMENT.md) - Detailed deployment guide
- [GITHUB_SECRETS.md](../GITHUB_SECRETS.md) - GitHub Actions secrets setup
- [QUICKSTART.md](../QUICKSTART.md) - Fast deployment guide
- [.github/workflows/deploy.yml](../../.github/workflows/deploy.yml) - CI/CD pipeline

---

**Last Updated**: April 25, 2026  
**Maintained By**: DevOps Team  
**Version**: 1.0.0
