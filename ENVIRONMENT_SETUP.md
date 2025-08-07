# Environment Variables Setup Guide

This guide will help you set up all the required environment variables for the Tweet-X project.

## Quick Start

1. Copy `env.example` to `.env`:
   ```bash
   cp env.example .env
   ```

2. Follow the sections below to get your API keys and update the `.env` file.

## 1. Supabase Configuration

### Getting Supabase Keys

1. **Go to [Supabase Dashboard](https://supabase.com/dashboard)**
2. **Create a new project** or select an existing one
3. **Navigate to Settings → API**
4. **Copy the following values:**
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### Example:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Important Notes:
- **Never commit your `.env` file** - it should be in your `.gitignore`
- The `service_role` key has admin privileges - keep it secure
- The `anon` key is safe to use in frontend code

## 2. Google AI Studio (Gemini) Configuration

### Getting Gemini API Key

1. **Go to [Google AI Studio](https://aistudio.google.com/)**
2. **Sign in with your Google account**
3. **Click "Get API key"** in the top right
4. **Create a new API key** or use an existing one
5. **Copy the API key**

### Example:
```env
GEMINI_API_KEY=AIzaSyC...
```

### Important Notes:
- The Gemini API key is used for generating tweets
- Keep this key secure and don't expose it in frontend code
- The key is only used in Supabase Edge Functions

## 3. Optional: Puppeteer Scraper API

### Getting Puppeteer API Key (Optional)

This is only needed if you're using a custom puppeteer scraper service for Twitter profile scraping.

1. **If you have a custom puppeteer service**, get the API key from your service provider
2. **If you don't have one**, you can leave this empty or remove the line

### Example:
```env
PUPPETEER_API_KEY=your-puppeteer-api-key-here
```

## 4. Frontend Environment Variables (Optional)

Currently, the frontend uses hardcoded Supabase values. If you want to make them configurable:

1. **Uncomment these lines in your `.env` file:**
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

2. **Update the Supabase client configuration** in `src/integrations/supabase/client.ts` to use these environment variables.

## 5. Setting Up Environment Variables

### For Local Development

1. **Create a `.env` file** in your project root
2. **Copy the contents from `env.example`**
3. **Replace the placeholder values** with your actual keys

### For Supabase Edge Functions

The environment variables are automatically available in Supabase Edge Functions. You can set them in the Supabase dashboard:

1. **Go to your Supabase project dashboard**
2. **Navigate to Settings → Edge Functions**
3. **Add your environment variables** there

### For Production Deployment

Depending on your deployment platform:

- **Vercel**: Add environment variables in the Vercel dashboard
- **Netlify**: Add environment variables in the Netlify dashboard
- **Railway**: Add environment variables in the Railway dashboard
- **Render**: Add environment variables in the Render dashboard

## 6. Testing Your Configuration

After setting up your environment variables:

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Test the Supabase connection** by trying to sign in/sign up
3. **Test the tweet generation** by creating a new tweet
4. **Check the browser console** for any errors

## 7. Troubleshooting

### Common Issues:

1. **"SUPABASE_URL not configured"**
   - Make sure your `.env` file exists and has the correct values
   - Check that the file is in the project root

2. **"GEMINI_API_KEY not configured"**
   - Verify your Gemini API key is correct
   - Make sure the key has the necessary permissions

3. **"Service unavailable" errors**
   - Check that your Supabase project is active
   - Verify your API keys are correct

4. **CORS errors**
   - Make sure your Supabase project URL is correct
   - Check that your domain is allowed in Supabase settings

### Getting Help:

- Check the [Supabase documentation](https://supabase.com/docs)
- Check the [Google AI Studio documentation](https://ai.google.dev/)
- Review the project's README for additional setup instructions

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use different API keys** for development and production
3. **Rotate your API keys** regularly
4. **Monitor your API usage** to avoid unexpected charges
5. **Use environment-specific configurations** for different deployment environments 