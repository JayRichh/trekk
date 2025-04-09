# Configuring CORS for Trekk API

This guide explains how to configure Cross-Origin Resource Sharing (CORS) in your .NET backend to allow requests from your Vercel-hosted frontend.

## Understanding CORS

CORS is a security feature implemented by browsers that restricts web pages from making requests to a different domain than the one that served the web page. For your Trekk application to work properly, the .NET backend must explicitly allow requests from your Vercel frontend domain.

## Current CORS Configuration

In the current `Program.cs` file, CORS is configured for local development:

```csharp
// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // Vue.js development server
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials(); // Required for SignalR
    });
});
```

## Updating CORS for Production

### Step 1: Update Program.cs

Modify your `Program.cs` file to read CORS origins from configuration:

```csharp
// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        // Get allowed origins from configuration
        var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() 
            ?? new string[] { "http://localhost:5173" };
            
        policy.WithOrigins(allowedOrigins)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials(); // Required for SignalR
    });
});
```

### Step 2: Update appsettings.json and appsettings.Production.json

Add the following to your `appsettings.json`:

```json
{
  "AllowedOrigins": [
    "http://localhost:5173"
  ]
}
```

And to your `appsettings.Production.json`:

```json
{
  "AllowedOrigins": [
    "https://your-app.vercel.app"
  ]
}
```

Replace `https://your-app.vercel.app` with your actual Vercel deployment URL.

### Step 3: Configure CORS in Azure

When your app is deployed to Azure, you can also set CORS through the Azure portal:

1. In Azure Portal, navigate to your App Service
2. Go to "API" → "CORS"
3. Add your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
4. Ensure "Enable Access-Control-Allow-Credentials" is checked for SignalR
5. Click "Save"

## Using Environment Variables

For more flexibility, you can set CORS origins using environment variables in Azure:

1. In Azure Portal, navigate to your App Service
2. Go to "Settings" → "Configuration" → "Application settings"
3. Add a new setting:
   - Name: `AllowedOrigins__0` (double underscore)
   - Value: `https://your-app.vercel.app`
4. Add any additional origins as `AllowedOrigins__1`, `AllowedOrigins__2`, etc.
5. Click "Save"

## Testing CORS Configuration

To test if your CORS configuration is working correctly:

1. Deploy your backend to Azure with the updated CORS settings
2. Deploy your frontend to Vercel
3. Open the browser developer tools (F12) and navigate to the Network tab
4. Interact with your application and verify that API requests succeed
5. If there are CORS errors, they will appear in the console

## CORS and SignalR

SignalR has additional CORS requirements for WebSocket connections:

1. The `AllowCredentials()` method must be called
2. Specific origins must be listed (wildcards like `*` are not allowed)
3. If using Azure SignalR Service, configure its CORS settings separately

## Common CORS Issues

- **Missing Headers**: The backend must include `Access-Control-Allow-Origin` with the correct origin
- **Credentials Not Allowed**: When using cookies/authentication, `Access-Control-Allow-Credentials` must be `true`
- **Methods Not Allowed**: Ensure `Access-Control-Allow-Methods` includes all needed HTTP methods
- **Headers Not Allowed**: Ensure `Access-Control-Allow-Headers` includes all custom headers

## Adding New Domains Later

When you add new deployment environments (staging, production) or custom domains:

1. Update the `AllowedOrigins` configuration to include the new domain
2. Redeploy your backend or update Azure App Service settings
