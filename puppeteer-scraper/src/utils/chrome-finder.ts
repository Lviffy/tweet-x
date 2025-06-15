
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

// Cache the Chrome executable path to avoid repeated searches
let cachedChromePath: string | undefined = undefined;

// Function to find Chrome executable with proper glob pattern support
export async function findChromeExecutable(): Promise<string | undefined> {
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
