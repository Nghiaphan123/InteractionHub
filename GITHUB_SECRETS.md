# GitHub Secrets Configuration Guide

## 📋 Overview

This document explains how to configure all required GitHub Secrets for the InteractHub CI/CD pipeline.

---

## 🔑 Required Secrets

### 1. AZURE_CREDENTIALS (Required)

**Purpose**: Authenticate GitHub Actions to Azure for deployment

**How to Create:**

```bash
# Step 1: Get your subscription ID
az account list --query "[].id" -o tsv

# Step 2: Create Service Principal
az ad sp create-for-rbac \
  --name "github-actions-interacthub" \
  --role "Contributor" \
  --scopes "/subscriptions/{SUBSCRIPTION_ID}"

# Output:
{
  "appId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "displayName": "github-actions-interacthub",
  "password": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "tenant": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

**Add to GitHub:**

1. Go to: Settings → Secrets and Variables → Actions
2. Click "New repository secret"
3. Name: `AZURE_CREDENTIALS`
4. Value: Paste the entire JSON output from the command above
5. Click "Add secret"

**Example Value:**
```json
{
  "appId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "displayName": "github-actions-interacthub",
  "password": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "tenant": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "subscriptionId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

---

### 2. AZURE_RESOURCE_GROUP_STAGING (Optional)

**Purpose**: Specify staging resource group for deployments

**Create Resource Group:**
```bash
az group create \
  --name interacthub-rg-staging \
  --location eastus
```

**Add to GitHub:**
1. Settings → Secrets and Variables → Actions
2. New repository secret
3. Name: `AZURE_RESOURCE_GROUP_STAGING`
4. Value: `interacthub-rg-staging`

---

### 3. AZURE_RESOURCE_GROUP_PRODUCTION (Optional)

**Purpose**: Specify production resource group for deployments

**Create Resource Group:**
```bash
az group create \
  --name interacthub-rg-production \
  --location eastus
```

**Add to GitHub:**
1. Settings → Secrets and Variables → Actions
2. New repository secret
3. Name: `AZURE_RESOURCE_GROUP_PRODUCTION`
4. Value: `interacthub-rg-production`

---

### 4. AZURE_STATIC_WEB_APPS_API_TOKEN_STAGING (Optional)

**Purpose**: Deploy frontend to Static Web Apps (staging)

**Get Token:**
```bash
# After creating Static Web Apps resource
az staticwebapp secrets list \
  --name interacthub-frontend-staging \
  --resource-group interacthub-rg-staging \
  --query "properties.apiKey" -o tsv
```

**Add to GitHub:**
1. Settings → Secrets and Variables → Actions
2. New repository secret
3. Name: `AZURE_STATIC_WEB_APPS_API_TOKEN_STAGING`
4. Paste the API token value

---

### 5. AZURE_STATIC_WEB_APPS_API_TOKEN_PRODUCTION (Optional)

**Purpose**: Deploy frontend to Static Web Apps (production)

**Get Token:**
```bash
az staticwebapp secrets list \
  --name interacthub-frontend \
  --resource-group interacthub-rg-production \
  --query "properties.apiKey" -o tsv
```

**Add to GitHub:**
1. Settings → Secrets and Variables → Actions
2. New repository secret
3. Name: `AZURE_STATIC_WEB_APPS_API_TOKEN_PRODUCTION`
4. Paste the API token value

---

### 6. SLACK_WEBHOOK (Optional)

**Purpose**: Send deployment notifications to Slack

**Create Webhook:**
1. Go to https://api.slack.com/apps
2. Create New App
3. Enable Incoming Webhooks
4. Add New Webhook to Workspace
5. Copy Webhook URL

**Add to GitHub:**
1. Settings → Secrets and Variables → Actions
2. New repository secret
3. Name: `SLACK_WEBHOOK`
4. Value: `https://hooks.slack.com/services/...`

---

### 7. DOCKER_REGISTRY_USERNAME & DOCKER_REGISTRY_PASSWORD (If using Docker)

**Purpose**: Push Docker images to container registry

**Add to GitHub:**
1. Settings → Secrets and Variables → Actions
2. New repository secrets:
   - Name: `DOCKER_REGISTRY_USERNAME`
   - Name: `DOCKER_REGISTRY_PASSWORD`

---

## 🔐 Environment Variables (vs Secrets)

### Configure Environment Variables

GitHub Actions Environment Variables (non-sensitive):

1. Go to: Settings → Secrets and Variables → **Variables** (not Secrets!)
2. Add variables:
   - `AZURE_REGION`: `eastus`
   - `RESOURCE_GROUP_STAGING`: `interacthub-rg-staging`
   - `RESOURCE_GROUP_PRODUCTION`: `interacthub-rg-production`
   - `APP_NAME`: `interacthub`
   - `AZURE_SUBSCRIPTION_ID`: Your subscription ID

---

## ✅ Verification Checklist

```bash
# Verify all secrets are set
gh secret list

# Output should show:
# AZURE_CREDENTIALS                 Updated ...
# AZURE_RESOURCE_GROUP_STAGING      Updated ...
# AZURE_RESOURCE_GROUP_PRODUCTION   Updated ...
# SLACK_WEBHOOK                     Updated ...
```

---

## 🛡️ Security Best Practices

### 1. **Rotate Secrets Regularly**
```bash
# Every 90 days
az ad sp credential reset --id app-id

# Update in GitHub
```

### 2. **Use Least Privilege**
```bash
# Instead of Contributor, consider limiting scope:
az role assignment create \
  --assignee "github-actions-interacthub" \
  --role "Website Contributor" \
  --scope "/subscriptions/{id}/resourceGroups/interacthub-rg-staging"
```

### 3. **Audit Secret Access**
```bash
# View secret access logs in GitHub
Settings → Audit log → Filter: secret
```

### 4. **Use Separate Service Principals**
```bash
# Create separate SPs for staging and production
az ad sp create-for-rbac --name "github-staging"
az ad sp create-for-rbac --name "github-production"
```

### 5. **Secure Storage**
- Never commit `.env` files
- Never share secret values in chat/email
- Use HTTPS for all deployments
- Enable branch protection rules

---

## 🚀 Usage in Workflow

The secrets are automatically available in the GitHub Actions workflow:

```yaml
- name: Azure Login
  uses: azure/login@v1
  with:
    creds: ${{ secrets.AZURE_CREDENTIALS }}

- name: Deploy to Azure
  uses: azure/arm-deploy@v1
  with:
    resourceGroupName: ${{ secrets.AZURE_RESOURCE_GROUP_STAGING }}
    template: ./azure/bicep/main.bicep
```

---

## 🔍 Troubleshooting

### Error: "Authentication failed"
```bash
# Verify Service Principal credentials
az login --service-principal \
  -u $AZURE_CLIENT_ID \
  -p $AZURE_CLIENT_SECRET \
  --tenant $AZURE_TENANT_ID
```

### Error: "Secret not found in workflow"
```bash
# Check secret name matches exactly (case-sensitive)
gh secret list

# Verify in workflow file:
${{ secrets.AZURE_CREDENTIALS }}  # Correct
${{ secrets.azure_credentials }}  # WRONG
```

### Cannot access Azure resources
```bash
# Check role assignments
az role assignment list \
  --assignee "github-actions-interacthub"

# Add necessary role if missing
az role assignment create \
  --assignee "github-actions-interacthub" \
  --role "Contributor" \
  --scope "/subscriptions/{id}/resourceGroups/interacthub-rg-staging"
```

---

## 📋 Setup Summary Checklist

- [ ] Create Service Principal for Azure authentication
- [ ] Add `AZURE_CREDENTIALS` secret
- [ ] Add resource group secrets (staging & production)
- [ ] Add Static Web Apps tokens (optional)
- [ ] Add Slack webhook (optional)
- [ ] Add Docker credentials (optional)
- [ ] Add environment variables
- [ ] Test workflow: Push to develop branch
- [ ] Verify deployment in Azure
- [ ] Check logs for any errors

---

## 🔗 References

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Azure Service Principal](https://docs.microsoft.com/en-us/cli/azure/create-an-azure-service-principal-azure-cli)
- [GitHub Actions for Azure](https://github.com/Azure/actions)

---

**Last Updated**: April 25, 2026
**Maintained By**: DevOps Team
