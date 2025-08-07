# Environment Variables Setup Guide

This guide will help you set up all the required environment variables for the Tweet-X application.

## 🚨 Security Notice

**IMPORTANT**: Never commit your `.env` file to version control. Make sure it's in your `.gitignore` file.

## 📁 Required Files

Create a `.env.local` file in your project root with the following structure:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# AI Services
GEMINI_API_KEY=your-gemini-api-key-here

# Optional: Puppeteer Scraper API
PUPPETEER_API_KEY=your-puppeteer-api-key-here

# Frontend Environment Variables
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 🔑 How to Get Your API Keys

### 1. Supabase Keys

#### Getting Supabase URL and Keys:

1. **Go to [Supabase](https://supabase.com/)**
2. **Sign in or create an account**
3. **Create a new project** or select an existing one
4. **Go to Settings → API** in your project dashboard
5. **Copy the following values:**
   - **Project URL** → Use as `SUPABASE_URL` and `VITE_SUPABASE_URL`
   - **anon public** → Use as `SUPABASE_ANON_KEY` and `VITE_SUPABASE_ANON_KEY`
   - **service_role secret** → Use as `SUPABASE_SERVICE_ROLE_KEY`

#### Example:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Google AI Studio (Gemini) API Key

#### Getting Gemini API Key:

1. **Go to [Google AI Studio](https://aistudio.google.com/)**
2. **Sign in with your Google account**
3. **Click "Get API key"** in the top right corner
4. **Create a new API key** or use an existing one
5. **Copy the API key**

#### Example:
```env
GEMINI_API_KEY=AIzaSyC...
```

### 3. Optional: Puppeteer API Key

This is only needed if you're using a custom puppeteer scraper service for Twitter profile scraping.

1. **If you have a custom puppeteer service**, get the API key from your service provider
2. **If you don't have one**, you can leave this empty or remove the line

#### Example:
```env
PUPPETEER_API_KEY=your-puppeteer-api-key-here
```

## 🔧 Setting Up Environment Variables

### For Local Development

1. **Create a `.env.local` file** in your project root
2. **Copy the template above** and replace the placeholder values
3. **Restart your development server** after making changes

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

## 🧪 Testing Your Configuration

After setting up your environment variables:

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Test the Supabase connection** by trying to sign in/sign up
3. **Test the tweet generation** by creating a new tweet
4. **Check the browser console** for any errors

## 🔍 Troubleshooting

### Common Issues:

1. **"GEMINI_API_KEY not configured"**
   - Make sure you've added the `GEMINI_API_KEY` to your environment variables
   - For Supabase Edge Functions, add it in the Supabase dashboard

2. **"Supabase connection failed"**
   - Verify your `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
   - Check that your Supabase project is active

3. **"Environment variables not loading"**
   - Make sure you're using `.env.local` for local development
   - Restart your development server after adding environment variables
   - For Vite, environment variables must be prefixed with `VITE_` to be available in the browser

### Security Best Practices:

1. **Never commit `.env` files** to version control
2. **Use different keys** for development and production
3. **Rotate your keys** regularly
4. **Use the service role key** only in secure backend environments
5. **The anon key is safe** to use in frontend code

## 📝 File Structure

Your project should have this structure:

```
tweet-x/
├── .env.local          # Your environment variables (not in git)
├── .env.example        # Template for environment variables
├── .gitignore          # Should include .env*
└── ... (other files)
```

Make sure your `.gitignore` includes:
```
.env
.env.local
.env.*.local
```

## 🎯 Next Steps

1. **Create your `.env.local` file** with the template above
2. **Get your API keys** following the instructions
3. **Test your setup** by running the application
4. **Deploy with environment variables** configured in your hosting platform

If you encounter any issues, check the browser console and server logs for error messages. 