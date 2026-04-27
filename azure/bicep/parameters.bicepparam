using './main.bicep'

param environment = 'staging'
param appName = 'interacthub'
param location = 'eastus'
param appServiceSku = 'B2'
param sqlAdminUsername = 'sqladmin'
param sqlAdminPassword = 'InteractHub@123456'  // Replace with secure password from Azure Key Vault in production
