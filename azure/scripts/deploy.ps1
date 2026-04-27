# Azure Deployment PowerShell Script for InteractHub
# Run as Administrator

param(
    [string]$Environment = "staging",
    [string]$AzureRegion = "eastus",
    [string]$SubscriptionId = ""
)

# Color functions
function Write-Success {
    Write-Host $args -ForegroundColor Green
}

function Write-Info {
    Write-Host $args -ForegroundColor Yellow
}

function Write-Error {
    Write-Host $args -ForegroundColor Red
}

# Main execution
Write-Success "======================================"
Write-Success "InteractHub Azure Deployment"
Write-Success "======================================"
Write-Info "Environment: $Environment"
Write-Info "Region: $AzureRegion"

# Step 1: Check Azure CLI
Write-Info "`n[1/6] Checking Azure CLI..."
$azVersion = az version --output json | ConvertFrom-Json
Write-Success "Azure CLI version: $($azVersion.'azure-cli')"

# Step 2: Set subscription
if ($SubscriptionId) {
    Write-Info "`n[2/6] Setting subscription..."
    az account set --subscription $SubscriptionId
} else {
    Write-Info "`n[2/6] Using current subscription..."
    $currentSub = az account show --output json | ConvertFrom-Json
    Write-Success "Current subscription: $($currentSub.name)"
}

# Step 3: Create resource group
$resourceGroupName = "interacthub-rg-$Environment"
Write-Info "`n[3/6] Creating resource group: $resourceGroupName..."
az group create `
    --name $resourceGroupName `
    --location $AzureRegion | Out-Null
Write-Success "Resource group created/verified"

# Step 4: Validate Bicep template
Write-Info "`n[4/6] Validating Bicep template..."
$validation = az deployment group validate `
    --resource-group $resourceGroupName `
    --template-file "azure\bicep\main.bicep" `
    --parameters `
        environment=$Environment `
        appName="interacthub" `
        location=$AzureRegion `
        sqlAdminUsername="sqladmin" `
        sqlAdminPassword="InteractHub@123456" `
    --output json

if ($?) {
    Write-Success "Template validation passed"
} else {
    Write-Error "Template validation failed"
    exit 1
}

# Step 5: Deploy infrastructure
Write-Info "`n[5/6] Deploying infrastructure (this may take 10-15 minutes)..."
$deploymentName = "interacthub-deployment-$(Get-Date -Format 'yyyyMMddHHmmss')"

$deploymentOutput = az deployment group create `
    --name $deploymentName `
    --resource-group $resourceGroupName `
    --template-file "azure\bicep\main.bicep" `
    --parameters `
        environment=$Environment `
        appName="interacthub" `
        location=$AzureRegion `
        sqlAdminUsername="sqladmin" `
        sqlAdminPassword="InteractHub@123456" `
    --output json | ConvertFrom-Json

# Extract outputs
$appServiceUrl = $deploymentOutput.properties.outputs.appServiceUrl.value
$appServiceName = $deploymentOutput.properties.outputs.appServiceName.value
$sqlServerFqdn = $deploymentOutput.properties.outputs.sqlServerFqdn.value
$storageAccount = $deploymentOutput.properties.outputs.storageAccountName.value
$keyVaultUrl = $deploymentOutput.properties.outputs.keyVaultUrl.value
$appInsightsKey = $deploymentOutput.properties.outputs.appInsightsInstrumentationKey.value

Write-Success "Infrastructure deployed successfully"

# Step 6: Configure and test
Write-Info "`n[6/6] Configuring application..."

# Configure CORS
az webapp cors add `
    --resource-group $resourceGroupName `
    --name $appServiceName `
    --allowed-origins "https://$appServiceName.azurewebsites.net" "http://localhost:3000" "http://localhost:5173" | Out-Null

# Enable logging
az webapp log config `
    --resource-group $resourceGroupName `
    --name $appServiceName `
    --application-logging true `
    --level verbose | Out-Null

Write-Success "Application configured"

# Output results
Write-Success "`n======================================"
Write-Success "Deployment Completed Successfully!"
Write-Success "======================================"
Write-Info "App Service URL: $appServiceUrl"
Write-Info "App Service Name: $appServiceName"
Write-Info "SQL Server: $sqlServerFqdn"
Write-Info "Storage Account: $storageAccount"
Write-Info "Key Vault: $keyVaultUrl"
Write-Info "Resource Group: $resourceGroupName"

# Save deployment info
$deploymentInfo = @{
    environment = $Environment
    deploymentTime = Get-Date -Format 'o'
    appServiceUrl = $appServiceUrl
    appServiceName = $appServiceName
    sqlServerFqdn = $sqlServerFqdn
    storageAccount = $storageAccount
    keyVaultUrl = $keyVaultUrl
    resourceGroup = $resourceGroupName
    appInsightsKey = $appInsightsKey
} | ConvertTo-Json

$deploymentInfo | Out-File -FilePath "deployment-output-$Environment.json"
Write-Success "`nDeployment info saved to: deployment-output-$Environment.json"

Write-Info "`nNext steps:"
Write-Info "1. Update your local appsettings.json with the connection strings"
Write-Info "2. Run database migrations: 'dotnet ef database update'"
Write-Info "3. Deploy the application: 'az webapp up --name $appServiceName'"
