# Deploying Trekk .NET Backend to Azure

This guide walks you through deploying the Trekk .NET backend to Azure App Service.

## Prerequisites

1. An Azure account - If you don't have one, create a [free account](https://azure.microsoft.com/en-us/free/)
2. [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) installed
3. [.NET SDK 10.0](https://dotnet.microsoft.com/download) installed
4. [Visual Studio Code](https://code.visualstudio.com/) with the Azure extension

## Step 1: Prepare Your .NET Application

1. Make sure your application runs locally without issues
2. Update appsettings.json to use configuration that will be overridden by Azure environment variables
3. Ensure CORS is properly configured to allow your Vercel frontend domain

## Step 2: Create Azure Resources

### Using Azure Portal (Easiest for Beginners)

1. Log in to the [Azure Portal](https://portal.azure.com/)
2. Click "Create a resource" → "Web App"
3. Configure your App Service:
   - Subscription: Select your subscription
   - Resource Group: Create new (e.g., "trekk-resources")
   - Name: Choose a unique name (e.g., "trekk-api") 

trekk-api
-emfegceegzf4drgd.westeurope-01.azurewebsites.net

   - Publish: Code
   - Runtime stack: .NET 10
   - Operating System: Windows
   - Region: Choose a region close to your users
   - App Service Plan: Create new (e.g., "trekk-plan") and select "Free F1" for testing
4. Click "Review + create" and then "Create"

### Using Azure CLI (For Automation)

```bash
# Login to Azure
az login

# Create a resource group
az group create --name trekk-resources --location westeurope

# Create an App Service Plan (Free tier for testing)
az appservice plan create --name trekk-plan --resource-group trekk-resources --sku F1

# Create the Web App
az webapp create --name trekk-api --resource-group trekk-resources --plan trekk-plan --runtime "DOTNET|10.0"
```

## Step 3: Configure Azure App Service Settings

### Set Environment Variables

1. In the Azure Portal, navigate to your App Service
2. Go to "Settings" → "Configuration" → "Application settings"
3. Add the following environment variables:
   - Supabase:Url - Your Supabase project URL
   - Supabase:Key - Your Supabase service role key
   - Other app-specific settings

### Using Azure CLI

```bash
# Set Supabase configuration
az webapp config appsettings set --resource-group trekk-resources --name trekk-api --settings Supabase:Url=https://your-project-id.supabase.co Supabase:Key=your-service-role-key
```

## Step 4: Configure CORS

1. In Azure Portal, go to your App Service
2. Navigate to "API" → "CORS"
3. Add your Vercel deployment URL (e.g., https://trekk.vercel.app)

## Step 5: Deploy Your Application

### Deploy using Visual Studio Code

1. Open VS Code with your project
2. Click on the Azure extension in the sidebar
3. Sign in to your Azure account
4. Find your App Service under your subscription
5. Right-click on your App Service and select "Deploy to Web App..."
6. Select the folder containing your .NET project (Backend/Trekk.Api)
7. Confirm the deployment

### Deploy using Azure CLI

```bash
# Navigate to your project directory
cd Backend/Trekk.Api

# Build and publish your app
dotnet publish -c Release

# Deploy to Azure
az webapp deployment source config-zip --resource-group trekk-resources --name trekk-api --src ./bin/Release/net10.0/publish/publish.zip
```

## Step 6: Configure SignalR Support (Optional but Recommended)

For better SignalR performance in production, use the Azure SignalR Service:

1. In Azure Portal, click "Create a resource" → search for "SignalR Service"
2. Create a new SignalR Service
3. Once created, go to your SignalR Service → "Keys" and copy the connection string
4. Add the connection string to your App Service Configuration:
   - Go to your App Service → "Configuration" → "Application settings"
   - Add `Azure:SignalR:ConnectionString` with your SignalR connection string

## Step 7: Test Your Deployment

Access your API at: https://trekk-api.azurewebsites.net/api/trails

## Continuous Deployment Options

For automated deployments, set up GitHub Actions:

1. In Azure Portal, go to your App Service
2. Under "Deployment Center", select "GitHub" and configure your repository
3. Azure will create a workflow file in your repository

## Troubleshooting

### View Logs

1. In Azure Portal, go to your App Service
2. Navigate to "Monitoring" → "Log stream" to see real-time logs
3. Check "Diagnose and solve problems" for more detailed troubleshooting

### Common Issues

- CORS issues: Ensure your CORS configuration includes the correct Vercel URL
- Missing dependencies: Check that all NuGet packages are properly restored
- Configuration errors: Verify all environment variables are correctly set

## Next Steps

1. Set up Azure Application Insights for monitoring
2. Configure automatic scaling for production workloads
3. Set up a custom domain and SSL certificate
