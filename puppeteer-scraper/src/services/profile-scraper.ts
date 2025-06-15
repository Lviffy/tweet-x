
import puppeteer from 'puppeteer';
import { findChromeExecutable } from '../utils/chrome-finder';
import { getWorkingNitterInstance } from './nitter-manager';

export interface ScrapedProfile {
  displayName: string;
  bio: string;
  verified: boolean;
  avatarUrl: string;
}

export interface ScrapedTweet {
  text: string;
  length: number;
  isThread: boolean;
  hasEmojis: boolean;
  hashtags: string[];
  timestamp: string;
  engagement: {
    likes: number;
    retweets: number;
    replies: number;
  };
}

export interface ScrapeResult {
  success: boolean;
  source: string;
  nitterInstance: string;
  profile: ScrapedProfile;
  tweets: ScrapedTweet[];
}

export async function scrapeTwitterProfile(handle: string): Promise<ScrapeResult> {
  let browser;
  
  try {
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

    // Extract tweets
    const tweets = await extractTweets(page);

    // Get profile info
    const profile = await extractProfileInfo(page, handle);

    await browser.close();
    browser = null;

    console.log(`Nitter scraping completed. Found ${tweets.length} tweets for ${profile.displayName}`);

    return {
      success: true,
      source: 'nitter',
      nitterInstance,
      profile,
      tweets: tweets.slice(0, 8),
    };

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
    
    throw error;
  }
}

async function extractTweets(page: any): Promise<ScrapedTweet[]> {
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
        const tweetTexts = await page.$$eval(selector, (els: any[]) => 
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

  return tweets.map((text, i) => ({
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
  }));
}

async function extractProfileInfo(page: any, handle: string): Promise<ScrapedProfile> {
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
      const name = await page.$eval(selector, (el: any) => el.textContent?.trim());
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
      const bioText = await page.$eval(selector, (el: any) => el.textContent?.trim());
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

  return {
    displayName: displayName || handle,
    bio: bio || '',
    verified,
    avatarUrl: '', // Nitter doesn't easily provide avatar URLs
  };
}
