# Environment Variables Management

## The Issue With Environment Files

We identified that environment variable files (`.env.production` and `.env.local`) were not being properly excluded from Git. The problem stemmed from conflicting patterns in `.gitignore`:

```
*.env*  # This pattern was too broad and caused conflicts
*.env
.env.*
.env.local
.env.development.local
.env.production
```

## Fixed .gitignore

We simplified and improved the `.gitignore` rules for environment variables:

```
# Environment variables
.env
.env.*
.env.local
.env.development
.env.production
```

This ensures all environment files will be properly excluded from Git.

## Best Practices for Environment Variables

1. **Never commit environment files with real credentials**
   - Use `.env.example` as a template showing required variables without actual values
   - Each developer should create their own `.env.local` for development

2. **Environment file types**:
   - `.env.local` - Local development only, never committed
   - `.env.development` - Development environment variables, never committed
   - `.env.production` - Production environment variables, never committed
   - `.env.example` - Template showing required variables, safe to commit

3. **Setting environment variables in production environments**:
   - **Vercel**: Set in the Vercel Dashboard under Project → Settings → Environment Variables
   - **Azure**: Set in Azure Portal under App Service → Configuration → Application settings

## Environment Variables in CI/CD

Environment variables for CI/CD are stored as GitHub Secrets and injected during the build process:

```yaml
env:
  VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
  VITE_API_URL: ${{ secrets.AZURE_API_URL }}
  VITE_DOC_API_KEY: ${{ secrets.DOC_API_KEY }}
```

## Required Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_SUPABASE_URL` | URL of your Supabase project | `https://xyzproject.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Anonymous key for Supabase | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `VITE_API_URL` | URL of your Azure-hosted .NET backend | `https://trekk-api.azurewebsites.net` |
| `VITE_DOC_API_KEY` | API key for DOC service (if using) | `abc123def456` |

## Next Steps

1. Delete `.env.production` and `.env.local` from your repository
2. Run: `git rm --cached .env.production .env.local`
3. Update your local `.env.local` file with your development credentials
4. Create environment variables in your Vercel and Azure deployments
