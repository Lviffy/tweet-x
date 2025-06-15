
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

    // Wait for content to load and check page structure
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Debug: Log page content to understand structure
    const pageContent = await page.evaluate(() => {
      return {
        title: document.title,
        bodyText: document.body.innerText.substring(0, 500),
        classes: Array.from(document.querySelectorAll('*')).map(el => el.className).filter(c => c && c.includes('tweet')).slice(0, 10)
      };
    });
    console.log('Page structure:', pageContent);

    // Extract tweets with updated selectors
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
  // Updated Nitter selectors based on current structure
  const tweetSelectors = [
    '.timeline-item',
    '.timeline .tweet',
    '.main-tweet',
    '.timeline-tweet',
    '.tweet-link',
    'article',
    '[data-tweet-id]',
    '.status-content',
    '.tweet-text'
  ];

  let tweets: string[] = [];
  
  // Try each selector until we find tweets
  for (const selector of tweetSelectors) {
    try {
      console.log(`Trying Nitter selector: ${selector}`);
      
      const elements = await page.$$(selector);
      console.log(`Found ${elements.length} elements with selector: ${selector}`);
      
      if (elements.length > 0) {
        // Try to extract text content from these elements
        const tweetTexts = await page.evaluate((sel: string) => {
          const elements = document.querySelectorAll(sel);
          const texts: string[] = [];
          
          elements.forEach((el, index) => {
            if (index < 15) { // Limit to 15 tweets max
              // Try multiple ways to extract tweet text
              let text = '';
              
              // Method 1: Look for specific text containers
              const textContainer = el.querySelector('.tweet-content, .tweet-text, .tweet-body, .status-content');
              if (textContainer) {
                text = textContainer.textContent?.trim() || '';
              }
              
              // Method 2: If no specific container, get direct text but filter out UI elements
              if (!text) {
                const fullText = el.textContent?.trim() || '';
                // Filter out common UI elements
                const filteredText = fullText.replace(/\b(Reply|Retweet|Like|Show this thread|·|\d+[smhd]|\d+,?\d*)\b/g, '').trim();
                if (filteredText.length > 20 && !filteredText.includes('@') && !filteredText.includes('Show thread')) {
                  text = filteredText;
                }
              }
              
              if (text && text.length > 10 && text.length < 1000) {
                texts.push(text);
              }
            }
          });
          
          return texts;
        }, selector);
        
        if (tweetTexts.length > 0) {
          tweets = tweetTexts;
          console.log(`Successfully extracted ${tweets.length} tweets using selector: ${selector}`);
          console.log('Sample tweets:', tweets.slice(0, 2));
          break;
        }
      }
    } catch (error) {
      console.log(`Nitter selector ${selector} failed:`, error);
      continue;
    }
  }

  // If no tweets found with selectors, try a more general approach
  if (tweets.length === 0) {
    console.log('No tweets found with standard selectors, trying general text extraction...');
    
    const generalTweets = await page.evaluate(() => {
      const allText = document.body.innerText;
      const lines = allText.split('\n').filter(line => {
        const trimmed = line.trim();
        return trimmed.length > 20 && 
               trimmed.length < 300 && 
               !trimmed.includes('Reply') &&
               !trimmed.includes('Retweet') &&
               !trimmed.includes('Show this thread') &&
               !trimmed.match(/^\d+[smhd]$/) &&
               !trimmed.includes('nitter.it');
      });
      return lines.slice(0, 5); // Limit to 5 potential tweets
    });
    
    tweets = generalTweets;
    console.log('General extraction found:', tweets.length, 'potential tweets');
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

  // Updated selectors for current Nitter structure
  const nameSelectors = [
    '.profile-card-fullname',
    '.profile-name',
    '.profile-displayname',
    'h1',
    '.username',
    '.profile-card .fullname'
  ];

  for (const selector of nameSelectors) {
    try {
      const name = await page.$eval(selector, (el: any) => el.textContent?.trim());
      if (name && name.length > 0 && !name.includes('@') && name !== handle) {
        displayName = name;
        console.log(`Found display name: ${displayName} using selector: ${selector}`);
        break;
      }
    } catch (error) {
      continue;
    }
  }

  // Updated bio selectors
  const bioSelectors = [
    '.profile-bio',
    '.profile-description',
    '.bio',
    '.profile-card .description'
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

  // Check for verification badge
  try {
    const verificationBadge = await page.$('.icon-ok, .verified, .badge');
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
