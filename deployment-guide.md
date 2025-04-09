# Trekk Complete Deployment Guide (2025)

This master guide provides all the steps needed to deploy the full Trekk application to production, using Vercel for the frontend and Azure for the .NET backend, while leveraging Supabase for authentication, database, and storage.

## Architecture Overview

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Client    │────▶│  Vercel.app  │────▶│  Azure App   │
│   Browser    │     │ Vue Frontend │     │ .NET Backend │
└──────────────┘     └──────────────┘     └──────────────┘
                           │                     │
                           │                     │
                           ▼                     ▼
                     ┌──────────────────────────────┐
                     │        Supabase Cloud        │
                     │ Auth, Database, Storage, RLS │
                     └──────────────────────────────┘
```

## Prerequisites

1. A [Vercel account](https://vercel.com/signup) (free tier available)
2. An [Azure account](https://azure.microsoft.com/en-us/free/) (free tier available)
3. A [Supabase account](https://app.supabase.io/) (free tier available)
4. [Git](https://git-scm.com/) installed locally
5. Your project code in a Git repository (GitHub, GitLab, or Bitbucket)
6. [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed
7. [.NET SDK 10.0](https://dotnet.microsoft.com/download) installed

## Deployment Checklist

- [ ] Deploy Supabase schema and migrations
- [ ] Configure Supabase Auth settings
- [ ] Deploy .NET backend to Azure
- [ ] Configure CORS settings on Azure
- [ ] Deploy Vue frontend to Vercel
- [ ] Link all services together with environment variables

## 1. Preparing Supabase Project

### Create and Configure Supabase Project

1. Log in to [Supabase Dashboard](https://app.supabase.io/)
2. Click "New Project" and set up your project
3. Note your project URL and API keys (found in Project Settings → API)

### Run Migrations

1. Install Supabase CLI if you haven't already:
   ```bash
   npm install -g supabase
   ```

2. Link your local project to your Supabase project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Push your migrations:
   ```bash
   supabase db push
   ```

### Configure Authentication

1. In Supabase Dashboard, go to Authentication → Settings
2. Configure Site URL to your Vercel deployment URL (after you deploy to Vercel)
3. Set up any additional auth providers if needed

## 2. Deploying .NET Backend to Azure

Follow the detailed instructions in [Backend/azure-deployment.md](Backend/azure-deployment.md).

Key steps:

1. Create Azure App Service
2. Configure Supabase connection in App Service settings
3. Deploy .NET application to Azure
4. Configure CORS as detailed in [Backend/cors-configuration.md](Backend/cors-configuration.md)
5. (Optional) Set up Azure SignalR Service for improved WebSocket support

## 3. Deploying Vue Frontend to Vercel

Follow the detailed instructions in [vercel-deployment.md](vercel-deployment.md).

Key steps:

1. Ensure `vercel.json` and `.env.production` are properly configured
2. Deploy to Vercel through Dashboard or CLI
3. Configure environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `VITE_API_URL`: Your Azure backend URL

## 4. Connecting Everything Together

### Update Supabase Site URL

1. Go to Supabase Dashboard → Authentication → Settings
2. Update Site URL to your Vercel deployment URL
3. Add your Vercel URLs to the redirect allow list

### Update CORS Configuration in Azure

1. In Azure Portal, navigate to your App Service
2. Go to API → CORS
3. Add your Vercel deployment URL

### Final Verification

1. Test authentication flow from Vercel frontend to Supabase
2. Test API calls from Vercel frontend to Azure backend
3. Test real-time features using SignalR

## Deployment FAQ

### Q: Should I deploy the backend or frontend first?
A: Deploy the backend first, as you'll need the backend URL to configure the frontend.

### Q: How do I update my application after making changes?
A: 
- **Frontend**: Push to your connected Git repository, and Vercel will automatically deploy
- **Backend**: Use Visual Studio Code Azure extension or Azure CLI to redeploy
- **Database**: Run `supabase db push` to apply new migrations

### Q: What about custom domains?
A: 
- Vercel: Settings → Domains → Add domain
- Azure: App Service → Custom domains → Add binding
- Update CORS and authentication settings with the new domains

### Q: How do I monitor my application?
A:
- Vercel: Analytics and Logs in Vercel Dashboard
- Azure: Application Insights or Log stream in App Service
- Supabase: SQL Editor for database monitoring

## Production Considerations

### Scaling

- **Vercel**: Automatically scales based on traffic
- **Azure**: Configure scale out rules in App Service plan
- **Supabase**: Monitor usage and upgrade plan if needed

### Security

- Ensure all environment variables are properly set
- Configure proper CORS settings to restrict access
- Set up proper Row Level Security in Supabase
- Use Azure Key Vault for sensitive keys and certificates

### Performance

- Enable caching for static assets in Vercel
- Configure Azure CDN for backend static assets
- Set up proper indexes in Supabase database

## Local Development After Deployment

For local development that connects to production services:

1. Create a `.env.local` file:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_API_URL=https://localhost:7285
   ```

2. Use the `run-trekk.bat` script to start both frontend and backend locally
