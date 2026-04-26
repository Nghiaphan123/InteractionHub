#!/bin/bash
# Azure Deployment Script for InteractHub
# This script sets up all necessary Azure resources

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT="${1:-staging}"
AZURE_REGION="${2:-eastus}"
RESOURCE_GROUP_NAME="interacthub-rg-${ENVIRONMENT}"
DEPLOYMENT_NAME="interacthub-deployment-$(date +%s)"

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}InteractHub Azure Deployment${NC}"
echo -e "${GREEN}======================================${NC}"
echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"
echo -e "${YELLOW}Region: ${AZURE_REGION}${NC}"
echo -e "${YELLOW}Resource Group: ${RESOURCE_GROUP_NAME}${NC}"

# Step 1: Create Resource Group
echo -e "\n${YELLOW}[1/5] Creating resource group...${NC}"
az group create \
  --name "${RESOURCE_GROUP_NAME}" \
  --location "${AZURE_REGION}" || echo "Resource group already exists"

# Step 2: Validate Bicep template
echo -e "\n${YELLOW}[2/5] Validating Bicep template...${NC}"
az deployment group validate \
  --resource-group "${RESOURCE_GROUP_NAME}" \
  --template-file azure/bicep/main.bicep \
  --parameters \
    environment="${ENVIRONMENT}" \
    appName="interacthub" \
    location="${AZURE_REGION}" \
    sqlAdminUsername="sqladmin" \
    sqlAdminPassword="$(openssl rand -base64 16)"

# Step 3: Deploy infrastructure
echo -e "\n${YELLOW}[3/5] Deploying infrastructure...${NC}"
DEPLOYMENT_OUTPUT=$(az deployment group create \
  --name "${DEPLOYMENT_NAME}" \
  --resource-group "${RESOURCE_GROUP_NAME}" \
  --template-file azure/bicep/main.bicep \
  --parameters \
    environment="${ENVIRONMENT}" \
    appName="interacthub" \
    location="${AZURE_REGION}" \
    sqlAdminUsername="sqladmin" \
    sqlAdminPassword="$(openssl rand -base64 16)" \
  --output json)

# Extract outputs
APP_SERVICE_URL=$(echo $DEPLOYMENT_OUTPUT | jq -r '.properties.outputs.appServiceUrl.value')
APP_SERVICE_NAME=$(echo $DEPLOYMENT_OUTPUT | jq -r '.properties.outputs.appServiceName.value')
SQL_SERVER_FQDN=$(echo $DEPLOYMENT_OUTPUT | jq -r '.properties.outputs.sqlServerFqdn.value')
STORAGE_ACCOUNT=$(echo $DEPLOYMENT_OUTPUT | jq -r '.properties.outputs.storageAccountName.value')
KEY_VAULT_URL=$(echo $DEPLOYMENT_OUTPUT | jq -r '.properties.outputs.keyVaultUrl.value')

# Step 4: Configure App Service
echo -e "\n${YELLOW}[4/5] Configuring App Service...${NC}"
az webapp config set \
  --resource-group "${RESOURCE_GROUP_NAME}" \
  --name "${APP_SERVICE_NAME}" \
  --startup-file "dotnet InteractHub.API.dll" \
  --generic-configurations "@azure/scripts/app-config.json" || true

# Step 5: Enable logging and monitoring
echo -e "\n${YELLOW}[5/5] Enabling logging and monitoring...${NC}"
az webapp log config \
  --resource-group "${RESOURCE_GROUP_NAME}" \
  --name "${APP_SERVICE_NAME}" \
  --application-logging true \
  --level verbose \
  --detailed-error-messages true \
  --failed-request-tracing true || true

# Output results
echo -e "\n${GREEN}======================================${NC}"
echo -e "${GREEN}Deployment Completed Successfully!${NC}"
echo -e "${GREEN}======================================${NC}"
echo -e "${YELLOW}App Service URL: ${APP_SERVICE_URL}${NC}"
echo -e "${YELLOW}SQL Server: ${SQL_SERVER_FQDN}${NC}"
echo -e "${YELLOW}Storage Account: ${STORAGE_ACCOUNT}${NC}"
echo -e "${YELLOW}Key Vault: ${KEY_VAULT_URL}${NC}"
echo -e "${YELLOW}Resource Group: ${RESOURCE_GROUP_NAME}${NC}"

# Save deployment info
echo "{
  \"environment\": \"${ENVIRONMENT}\",
  \"deploymentTime\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
  \"appServiceUrl\": \"${APP_SERVICE_URL}\",
  \"appServiceName\": \"${APP_SERVICE_NAME}\",
  \"sqlServerFqdn\": \"${SQL_SERVER_FQDN}\",
  \"storageAccount\": \"${STORAGE_ACCOUNT}\",
  \"keyVaultUrl\": \"${KEY_VAULT_URL}\",
  \"resourceGroup\": \"${RESOURCE_GROUP_NAME}\"
}" > deployment-output-${ENVIRONMENT}.json

echo -e "\n${GREEN}Deployment info saved to: deployment-output-${ENVIRONMENT}.json${NC}"
