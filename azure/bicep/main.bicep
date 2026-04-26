metadata description = 'InteractHub Azure Infrastructure - Bicep Template'

@description('Environment name (staging or production)')
param environment string = 'staging'

@description('Application name')
param appName string = 'interacthub'

@description('Azure region for resources')
param location string = resourceGroup().location

@description('App Service Plan SKU')
param appServiceSku string = environment == 'production' ? 'P1V2' : 'B2'

@description('SQL Server admin username')
param sqlAdminUsername string = 'sqladmin'

@secure()
@description('SQL Server admin password')
param sqlAdminPassword string

var uniqueSuffix = uniqueString(resourceGroup().id)
var appServicePlanName = '${appName}-plan-${environment}'
var appServiceName = '${appName}-api-${environment}'
var sqlServerName = '${appName}-sql-${uniqueSuffix}'
var sqlDatabaseName = 'InteractHub_${environment}'
var storageAccountName = '${replace(appName, '-', '')}storage${environment}${uniqueSuffix}'
var keyVaultName = '${appName}-kv-${environment}'
var appInsightsName = '${appName}-insights-${environment}'
var logAnalyticsName = '${appName}-logs-${environment}'

// ========== Log Analytics Workspace ==========
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2021-12-01-preview' = {
  name: logAnalyticsName
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

// ========== Application Insights ==========
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    RetentionInDays: 90
    WorkspaceResourceId: logAnalytics.id
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

// ========== App Service Plan ==========
resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: appServicePlanName
  location: location
  kind: 'linux'
  properties: {
    reserved: true
  }
  sku: {
    name: appServiceSku
    tier: environment == 'production' ? 'PremiumV2' : 'Basic'
    capacity: environment == 'production' ? 2 : 1
  }
}

// ========== App Service (Backend API) ==========
resource appService 'Microsoft.Web/sites@2022-03-01' = {
  name: appServiceName
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'DOTNETCORE|8.0'
      alwaysOn: environment == 'production' ? true : false
      http20Enabled: true
      minTlsVersion: '1.2'
      appSettings: [
        {
          name: 'ASPNETCORE_ENVIRONMENT'
          value: environment == 'production' ? 'Production' : 'Development'
        }
        {
          name: 'APPINSIGHTS_INSTRUMENTATIONKEY'
          value: appInsights.properties.InstrumentationKey
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
        {
          name: 'ApplicationInsightsAgent_EXTENSION_VERSION'
          value: '~3'
        }
        {
          name: 'CORS_ALLOWED_ORIGINS'
          value: environment == 'production' ? 'https://${appServiceName}.azurewebsites.net' : 'http://localhost:5173,http://localhost:3000'
        }
      ]
      connectionStrings: [
        {
          name: 'DefaultConnection'
          connectionString: 'Server=tcp:${sqlServer.properties.fullyQualifiedDomainName},1433;Initial Catalog=${sqlDatabaseName};Persist Security Info=False;User ID=${sqlAdminUsername};Password=${sqlAdminPassword};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;'
          type: 'SQLAzure'
        }
      ]
      healthCheckPath: '/api/health'
      numberOfWorkers: 1
      defaultDocuments: []
    }
  }
}

// ========== SQL Server ==========
resource sqlServer 'Microsoft.Sql/servers@2021-11-01-preview' = {
  name: sqlServerName
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    administratorLogin: sqlAdminUsername
    administratorLoginPassword: sqlAdminPassword
    version: '12.0'
    publicNetworkAccessEnabled: true
  }
}

// ========== SQL Database ==========
resource sqlDatabase 'Microsoft.Sql/servers/databases@2021-11-01-preview' = {
  parent: sqlServer
  name: sqlDatabaseName
  location: location
  sku: {
    name: environment == 'production' ? 'S2' : 'S0'
    tier: environment == 'production' ? 'Standard' : 'Standard'
  }
  properties: {
    collation: 'SQL_Latin1_General_CP1_CI_AS'
    maxSizeBytes: environment == 'production' ? 268435456000 : 1073741824
    zoneRedundant: environment == 'production' ? true : false
  }
}

// ========== SQL Firewall Rule (Allow Azure Services) ==========
resource sqlFirewallRule 'Microsoft.Sql/servers/firewallRules@2021-11-01-preview' = {
  parent: sqlServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// ========== Storage Account (Blob Storage) ==========
resource storageAccount 'Microsoft.Storage/storageAccounts@2022-05-01' = {
  name: storageAccountName
  location: location
  kind: 'StorageV2'
  sku: {
    name: environment == 'production' ? 'Standard_GRS' : 'Standard_LRS'
  }
  properties: {
    accessTier: 'Hot'
    allowBlobPublicAccess: false
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    networkAcls: {
      bypass: 'AzureServices'
      defaultAction: 'Allow'
    }
  }
}

// ========== Blob Container ==========
resource blobContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2022-05-01' = {
  name: '${storageAccount.name}/default/uploads'
  properties: {
    publicAccess: 'None'
  }
}

// ========== Key Vault ==========
resource keyVault 'Microsoft.KeyVault/vaults@2022-07-01' = {
  name: keyVaultName
  location: location
  properties: {
    tenantId: subscription().tenantId
    sku: {
      family: 'A'
      name: 'standard'
    }
    accessPolicies: [
      {
        tenantId: subscription().tenantId
        objectId: appService.identity.principalId
        permissions: {
          secrets: ['get', 'list']
          keys: ['get', 'list']
        }
      }
    ]
    enabledForTemplateDeployment: true
    enabledForDiskEncryption: false
    enabledForDeployment: true
    enableRbacAuthorization: true
    softDeleteRetentionInDays: 90
  }
}

// ========== Key Vault Secret - Connection String ==========
resource kvConnectionString 'Microsoft.KeyVault/vaults/secrets@2022-07-01' = {
  parent: keyVault
  name: 'ConnectionString'
  properties: {
    value: 'Server=tcp:${sqlServer.properties.fullyQualifiedDomainName},1433;Initial Catalog=${sqlDatabaseName};Persist Security Info=False;User ID=${sqlAdminUsername};Password=${sqlAdminPassword};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;'
  }
}

// ========== Key Vault Secret - Storage Connection String ==========
resource kvStorageConnectionString 'Microsoft.KeyVault/vaults/secrets@2022-07-01' = {
  parent: keyVault
  name: 'StorageConnectionString'
  properties: {
    value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${listKeys(storageAccount.id, '2022-05-01').keys[0].value};EndpointSuffix=core.windows.net'
  }
}

// ========== OUTPUTS ==========
output appServiceUrl string = 'https://${appService.properties.defaultHostName}'
output appServiceName string = appService.name
output sqlServerFqdn string = sqlServer.properties.fullyQualifiedDomainName
output storageAccountName string = storageAccount.name
output keyVaultUrl string = keyVault.properties.vaultUri
output appInsightsInstrumentationKey string = appInsights.properties.InstrumentationKey
output appInsightsConnectionString string = appInsights.properties.ConnectionString
