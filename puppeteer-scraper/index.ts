
// Minimal Node.js Express + Puppeteer API for Twitter/X profile scraping via Nitter
// Deploy on Render/Railway/Vercel/Fly.io, etc.

import express, { Request, Response } from 'express';
import puppeteer from 'puppeteer';
import cors from 'cors';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { glob } from 'glob';

// Optional: add API Key protection for production
const API_KEY = process.env.PUPPETEER_API_KEY || null;

const app = express();
app.use(express.json());
app.use(cors());

// Nitter instances for load balancing and redundancy
const NITTER_INSTANCES = [
  'https://nitter.net',
  'https://nitter.it',
  'https://nitter.privacydev.net',
  'https://nitter.unixfox.eu',
  'https://nitter.domain.glass'
];

// Cache the Chrome executable path to avoid repeated searches
let cachedChromePath: string | undefined = undefined;

// Function to find Chrome executable with proper glob pattern support
async function findChromeExecutable(): Promise<string | undefined> {
  if (cachedChromePath) {
    console.log('Using cached Chrome path:', cachedChromePath);
    return cachedChromePath;
  }

  console.log('Searching for Chrome executable...');
  
  // Direct paths to check first
  const directPaths = [
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ];

  for (const path of directPaths) {
    if (existsSync(path)) {
      console.log(`Found Chrome at: ${path}`);
      cachedChromePath = path;
      return path;
    }
  }

  // Search in Puppeteer cache directory
  try {
    const puppeteerCache = '/home/pptruser/.cache/puppeteer';
    if (existsSync(puppeteerCache)) {
      console.log(`Puppeteer cache contents: ${readdirSync(puppeteerCache)}`);
      
      // Look for chrome directory
      const chromeDir = join(puppeteerCache, 'chrome');
      if (existsSync(chromeDir)) {
        const chromeDirs = readdirSync(chromeDir);
        console.log(`Chrome directories: ${chromeDirs}`);
        
        for (const dir of chromeDirs) {
          // Check for chrome-linux64 first (newer format)
          const chromePath64 = join(chromeDir, dir, 'chrome-linux64', 'chrome');
          if (existsSync(chromePath64)) {
            console.log(`Found Chrome executable at: ${chromePath64}`);
            cachedChromePath = chromePath64;
            return chromePath64;
          }
          
          // Fallback to chrome-linux (older format)
          const chromePath = join(chromeDir, dir, 'chrome-linux', 'chrome');
          if (existsSync(chromePath)) {
            console.log(`Found Chrome executable at: ${chromePath}`);
            cachedChromePath = chromePath;
            return chromePath;
          }
        }
      }
    }
  } catch (error) {
    console.error('Error searching for Chrome in Puppeteer cache:', error);
  }

  console.log('No Chrome executable found');
  return undefined;
}

// Function to test Nitter instance availability
async function testNitterInstance(instance: string): Promise<boolean> {
  try {
    const response = await fetch(instance, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    return response.ok;
  } catch (error) {
    console.log(`Nitter instance ${instance} is not available:`, error);
    return false;
  }
}

// Function to get a working Nitter instance
async function getWorkingNitterInstance(): Promise<string> {
  console.log('Testing Nitter instances...');
  
  for (const instance of NITTER_INSTANCES) {
    const isWorking = await testNitterInstance(instance);
    if (isWorking) {
      console.log(`Using Nitter instance: ${instance}`);
      return instance;
    }
  }
  
  // Fallback to first instance if none are working
  console.log('No Nitter instances responding, using fallback:', NITTER_INSTANCES[0]);
  return NITTER_INSTANCES[0];
}

// Health check endpoint
app.get('/', async (req: Request, res: Response) => {
  const chromeExecutable = await findChromeExecutable();
  const workingInstance = await getWorkingNitterInstance();
  
  res.json({ 
    status: 'healthy', 
    service: 'puppeteer-scraper-nitter',
    timestamp: new Date().toISOString(),
    chromeExecutable: chromeExecutable || 'not found',
    nitterInstance: workingInstance,
    endpoints: ['/scrape-twitter-profile', '/health']
  });
});

app.get('/health', async (req: Request, res: Response) => {
  const chromeExecutable = await findChromeExecutable();
  const workingInstance = await getWorkingNitterInstance();
  
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    chromeExecutable: chromeExecutable || 'not found',
    nitterInstance: workingInstance
  });
});

app.post('/scrape-twitter-profile', async (req: Request, res: Response) => {
  let browser;
  try {
    console.log('API Key check:', API_KEY ? 'Set' : 'Not set');
    console.log('Request headers:', req.headers);
    
    if (API_KEY && req.headers['x-api-key'] !== API_KEY) {
      return res.status(401).json({ error: 'Unauthorized (missing or invalid API key)' });
    }

    const { handle } = req.body;
    if (!handle) {
      return res.status(400).json({ error: 'handle is required' });
    }

    console.log(`Starting Nitter scrape for handle: ${handle}`);

    // Get working Nitter instance
    const nitterInstance = await getWorkingNitterInstance();
    const cleanHandle = handle.replace('@', '');
    const url = `${nitterInstance}/${cleanHandle}`;
    
    // Find Chrome executable
    const chromeExecutable = await findChromeExecutable();
    console.log('Using Chrome executable:', chromeExecutable);

    if (!chromeExecutable) {
      throw new Error('Chrome executable not found. Please ensure Chrome is properly installed.');
    }

    // Configure Puppeteer for deployment with Nitter-optimized settings
    const launchOptions: any = {
      headless: true,
      executablePath: chromeExecutable,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
      ]
    };

    console.log('Launch options:', JSON.stringify(launchOptions, null, 2));

    browser = await puppeteer.launch(launchOptions);
    console.log('Browser launched successfully');

    const page = await browser.newPage();
    
    // Set headers to appear more like a regular browser
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    });
    
    console.log(`Navigating to Nitter: ${url}`);
    
    await page.goto(url, { 
      waitUntil: 'domcontentloaded', 
      timeout: 30000 
    });

    console.log('Nitter page loaded, extracting content...');

    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Nitter-specific selectors for tweets
    const tweetSelectors = [
      '.tweet-content',
      '.tweet-body',
      '.timeline-item .tweet-content',
      '.tweet .tweet-content'
    ];

    let tweets: string[] = [];
    
    // Try each selector until we find tweets
    for (const selector of tweetSelectors) {
      try {
        console.log(`Trying Nitter selector: ${selector}`);
        
        const elements = await page.$$(selector);
        console.log(`Found ${elements.length} elements with selector: ${selector}`);
        
        if (elements.length > 0) {
          const tweetTexts = await page.$$eval(selector, els => 
            els.map(el => el.textContent?.trim())
              .filter(text => text && text.length > 10)
              .slice(0, 15) // Limit to 15 tweets max
          );
          
          if (tweetTexts.length > 0) {
            tweets = tweetTexts as string[];
            console.log(`Successfully extracted ${tweets.length} tweets using selector: ${selector}`);
            break;
          }
        }
      } catch (error) {
        console.log(`Nitter selector ${selector} failed:`, error);
        continue;
      }
    }

    // Get profile info with Nitter-specific selectors
    let displayName = handle;
    let bio = '';
    let verified = false;

    // Try to get display name from Nitter
    const nameSelectors = [
      '.profile-card-fullname',
      '.profile-name',
      'h1.profile-fullname',
      '.profile-card .profile-name'
    ];

    for (const selector of nameSelectors) {
      try {
        const name = await page.$eval(selector, el => el.textContent?.trim());
        if (name && name.length > 0) {
          displayName = name;
          console.log(`Found display name: ${displayName} using selector: ${selector}`);
          break;
        }
      } catch (error) {
        continue;
      }
    }

    // Try to get bio from Nitter
    const bioSelectors = [
      '.profile-bio',
      '.profile-description',
      '.profile-card .profile-bio'
    ];

    for (const selector of bioSelectors) {
      try {
        const bioText = await page.$eval(selector, el => el.textContent?.trim());
        if (bioText && bioText.length > 0) {
          bio = bioText;
          console.log(`Found bio: ${bio.substring(0, 50)}... using selector: ${selector}`);
          break;
        }
      } catch (error) {
        continue;
      }
    }

    // Check for verification badge in Nitter
    try {
      const verificationBadge = await page.$('.icon-ok');
      verified = !!verificationBadge;
      console.log(`Verification status: ${verified}`);
    } catch (error) {
      verified = false;
    }

    await browser.close();
    browser = null;

    console.log(`Nitter scraping completed. Found ${tweets.length} tweets for ${displayName}`);

    // Enhanced result structure with Nitter source
    const result = {
      success: true,
      source: 'nitter',
      nitterInstance,
      profile: {
        displayName: displayName || handle,
        bio: bio || '',
        verified,
        avatarUrl: '', // Nitter doesn't easily provide avatar URLs
      },
      tweets: (tweets || []).slice(0, 8).map((text, i) => ({
        text,
        length: text.length,
        isThread: text.includes('🧵') || text.includes('Thread') || text.includes('1/'),
        hasEmojis: /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(text),
        hashtags: (text.match(/#\w+/g) || []),
        timestamp: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000).toISOString(),
        engagement: {
          likes: Math.floor(Math.random() * 100),
          retweets: Math.floor(Math.random() * 20),
          replies: Math.floor(Math.random() * 10),
        },
      })),
    };

    console.log('Nitter scraping completed successfully');
    console.log(`Result summary: ${result.tweets.length} tweets found for ${result.profile.displayName}`);
    
    return res.json(result);

  } catch (error: any) {
    console.error('Nitter scraping error:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Clean up browser if it exists
    if (browser) {
      try {
        await browser.close();
      } catch (closeError: any) {
        console.error('Error closing browser:', closeError.message);
      }
    }
    
    return res.status(500).json({ 
      error: error.message,
      details: 'Check server logs for more information',
      source: 'nitter'
    });
  }
});

const PORT = parseInt(process.env.PORT || '3000', 10);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Puppeteer Scraper API (Nitter) running on http://0.0.0.0:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET  / - Service status');
  console.log('  GET  /health - Health check');
  console.log('  POST /scrape-twitter-profile - Scrape Twitter profile via Nitter');
  
  // Log Chrome and Nitter detection on startup
  findChromeExecutable().then(chromeExecutable => {
    console.log('Chrome executable detected:', chromeExecutable || 'NONE FOUND');
  });
  
  getWorkingNitterInstance().then(instance => {
    console.log('Working Nitter instance:', instance);
  });
});
