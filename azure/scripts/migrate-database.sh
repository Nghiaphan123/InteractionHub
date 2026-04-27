#!/bin/bash
# Database Migration Script for InteractHub
# Run after deploying Azure resources

set -e

# Configuration
ENVIRONMENT="${1:-staging}"
APP_SERVICE_NAME="interacthub-api-${ENVIRONMENT}"
RESOURCE_GROUP="interacthub-rg-${ENVIRONMENT}"

echo "======================================"
echo "Database Migration for $ENVIRONMENT"
echo "======================================"

# Step 1: Get connection string from Azure
echo "[1/4] Retrieving database connection string..."
CONNECTION_STRING=$(az webapp config connection-string list \
  --resource-group $RESOURCE_GROUP \
  --name $APP_SERVICE_NAME \
  --query "[0].value" -o tsv)

if [ -z "$CONNECTION_STRING" ]; then
  echo "Error: Could not retrieve connection string"
  exit 1
fi

echo "Connection string retrieved successfully"

# Step 2: Update local appsettings
echo "[2/4] Updating appsettings.json..."
cat > InteractionHub/InteractHub.API/appsettings.${ENVIRONMENT}.json <<EOF
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning"
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "${CONNECTION_STRING}"
  },
  "Jwt": {
    "Key": "$(openssl rand -base64 32)",
    "Issuer": "https://${APP_SERVICE_NAME}.azurewebsites.net",
    "Audience": "InteractHub"
  },
  "AllowedHosts": "*",
  "CORS": {
    "AllowedOrigins": "https://${APP_SERVICE_NAME}.azurewebsites.net"
  }
}
EOF

echo "appsettings.${ENVIRONMENT}.json created"

# Step 3: Run EF migrations
echo "[3/4] Running Entity Framework migrations..."
cd InteractionHub/InteractHub.API

dotnet ef database update \
  --context AppDbContext \
  --configuration "${ENVIRONMENT^}" \
  --verbose || {
  echo "Migration failed. Please check the error messages above."
  exit 1
}

cd ../..

echo "Database migrations completed"

# Step 4: Seed data (optional)
echo "[4/4] Seeding initial data (optional)..."
echo "If you want to seed data, run:"
echo "  dotnet ef database seed"

echo "======================================"
echo "Database Migration Completed!"
echo "======================================"
echo "The database is now ready for deployment."
