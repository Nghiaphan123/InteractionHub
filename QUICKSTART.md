# InteractHub - Azure Deployment Quick Start

⚡ **Get your application running on Azure in 10 minutes!**

---

## 🎯 Prerequisites (5 min)

Before starting, ensure you have:

```bash
# Check installations
az version                    # Azure CLI
dotnet --version            # .NET SDK
node --version             # Node.js
git --version              # Git

# If missing any, install from:
# - Azure CLI: https://aka.ms/azure-cli
# - .NET 8: https://dotnet.microsoft.com/download
# - Node.js: https://nodejs.org
```

---

## 🚀 Deployment (5 minutes)

### Option 1: **One-Command Deployment (Recommended)**

```bash
# Windows PowerShell
cd InteractionHub
.\azure\scripts\deploy.ps1 -Environment staging

# Linux/Mac Bash
cd InteractionHub
bash azure/scripts/deploy.sh staging eastus
```

That's it! ✅ Your infrastructure is now deploying.

---

### Option 2: **Step-by-Step Manual Deployment**

#### Step 1: Login to Azure
```bash
az login
az account show
```

#### Step 2: Create Resource Group
```bash
az group create \
  --name interacthub-rg-staging \
  --location eastus
```

#### Step 3: Deploy Infrastructure
```bash
az deployment group create \
  --resource-group interacthub-rg-staging \
  --template-file azure/bicep/main.bicep \
  --parameters \
    environment=staging \
    sqlAdminPassword="YourSecurePassword123!"
```

#### Step 4: Get Deployment Outputs
```bash
az deployment group show \
  --resource-group interacthub-rg-staging \
  --name interacthub-deployment-* \
  --query properties.outputs -o json
```

---

## 📝 Post-Deployment Setup (5 min)

### 1. **Configure Database Connection**

```bash
# Get your SQL connection string
APP_SERVICE_NAME="interacthub-api-staging"
RESOURCE_GROUP="interacthub-rg-staging"

SQL_CONN_STRING=$(az webapp config connection-string list \
  --resource-group $RESOURCE_GROUP \
  --name $APP_SERVICE_NAME \
  --query "[0].value" -o tsv)

echo $SQL_CONN_STRING
```

### 2. **Run Database Migrations**

```bash
cd InteractionHub/InteractHub.API

# Update connection string
dotnet user-secrets set ConnectionStrings:DefaultConnection "$SQL_CONN_STRING"

# Run migrations
dotnet ef database update
```

### 3. **Deploy Application Code**

```bash
# From InteractionHub directory
az webapp up \
  --name interacthub-api-staging \
  --resource-group interacthub-rg-staging \
  --runtime "DOTNETCORE|8.0"
```

---

## ✅ Verification (2 min)

### Check Deployment Status

```bash
# View App Service
az webapp show \
  --resource-group interacthub-rg-staging \
  --name interacthub-api-staging \
  --query "{name: name, state: state, url: defaultHostName}" -o table

# Test API endpoint
curl https://interacthub-api-staging.azurewebsites.net/api/health
# Expected: 200 OK with health status
```

### View Logs

```bash
# Stream live logs
az webapp log tail \
  --resource-group interacthub-rg-staging \
  --name interacthub-api-staging

# Check Application Insights
az monitor app-insights metrics show \
  --app interacthub-insights-staging \
  --resource-group interacthub-rg-staging \
  --metric pageViews
```

---

## 🔄 Enable CI/CD (3 min)

### GitHub Actions Setup

1. **Create Service Principal:**
```bash
az ad sp create-for-rbac \
  --name "github-actions-interacthub" \
  --role "Contributor" \
  --scopes "/subscriptions/$(az account show --query id -o tsv)"
```

2. **Add GitHub Secret:**
   - Go to GitHub → Settings → Secrets → New repository secret
   - Name: `AZURE_CREDENTIALS`
   - Value: Paste entire JSON output from above

3. **Push to Deploy:**
```bash
git add .
git commit -m "Enable CI/CD"
git push origin main
# Automatically triggers: Build → Test → Deploy to Production
```

---

## 📊 Dashboard Access

### View Your Application

```bash
# App Service
https://interacthub-api-staging.azurewebsites.net

# Application Insights
https://portal.azure.com → InteractHub-insights-staging

# SQL Database
https://portal.azure.com → SQL databases → InteractHub_staging
```

---

## 💾 Cost Tracking

```bash
# Estimate costs
az cost management query create \
  --timeframe MonthToDate \
  --type Usage \
  --scope "/subscriptions/$(az account show --query id -o tsv)"

# Current monthly estimate: ~$70 (staging) + ~$150 (production)
```

---

## 🆘 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| **Can't login to Azure** | Run `az login` and verify subscription with `az account show` |
| **Deployment fails** | Check resource group exists: `az group show -n interacthub-rg-staging` |
| **App can't connect to database** | Verify firewall: `az sql server firewall-rule list -g ... -s ...` |
| **Slow performance** | Scale up: `az appservice plan update --sku P1V2` |
| **Out of storage** | Check blob: `az storage account show-connection-string -n ...` |

---

## 📚 Next Steps

- ✅ Read [DEPLOYMENT.md](DEPLOYMENT.md) for detailed guide
- ✅ Setup [GitHub Secrets](GITHUB_SECRETS.md)
- ✅ Enable monitoring: Application Insights dashboard
- ✅ Configure CI/CD: GitHub Actions workflow
- ✅ Scale for production: Review cost & performance

---

## 🎓 Learning Resources

- [Azure App Service Best Practices](https://docs.microsoft.com/azure/app-service/overview-hosting-plans)
- [Infrastructure as Code with Bicep](https://docs.microsoft.com/azure/azure-resource-manager/bicep/)
- [GitHub Actions for Azure](https://github.com/Azure/actions)
- [.NET on Azure](https://docs.microsoft.com/azure/app-service/quickstart-dotnetcore)

---

## 💬 Need Help?

```bash
# View all created resources
az resource list --resource-group interacthub-rg-staging

# Clean up everything
az group delete --name interacthub-rg-staging

# Get deployment logs
az deployment group operation list \
  --resource-group interacthub-rg-staging \
  --name interacthub-deployment-*
```

---

**🎉 Congratulations! Your application is now on Azure!**

Time elapsed: ~15 minutes ⏱️  
Resources created: 10+  
Ready for: Testing → Production 🚀

---

*For more details, see [DEPLOYMENT.md](DEPLOYMENT.md)*
