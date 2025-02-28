# Magento PIM

A Product Information Management application for Magento products.

## Features

- Import/export Magento product data
- Edit product information in a tabular interface
- Manage product hierarchies
- Integration with Supabase for data persistence

## Deployment to GitHub Pages

This application can be deployed to GitHub Pages with the following steps:

### 1. Configure Supabase Credentials

Before deploying, you need to update the Supabase credentials in `public/config.js`:

```javascript
window.SUPABASE_URL = "https://your-supabase-project-id.supabase.co";
window.SUPABASE_ANON_KEY = "your-supabase-anon-key";
window.ENABLE_SUPABASE = true; // Set to false to disable Supabase connection
```

Alternatively, you can set these as GitHub secrets and they will be included in the build:

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Add the following secrets:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous API key

### 2. Push to GitHub

Make sure your code is pushed to the main (or master) branch of your GitHub repository.

### 3. Enable GitHub Pages

1. Go to your GitHub repository
2. Navigate to Settings > Pages
3. Select "GitHub Actions" as the source
4. The workflow will automatically build and deploy your site

### 4. Manual Deployment

If you prefer to deploy manually, you can run:

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Deploy to GitHub Pages (requires gh-pages package)
npm run deploy
```

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## License

MIT 