
import express, { Request, Response } from 'express';
import cors from 'cors';
import { scrapeTwitterProfile } from './src/services/profile-scraper';
import { getHealthStatus } from './src/utils/health-check';
import { findChromeExecutable } from './src/utils/chrome-finder';
import { getWorkingNitterInstance } from './src/services/nitter-manager';

// Optional: add API Key protection for production
const API_KEY = process.env.PUPPETEER_API_KEY || null;

const app = express();
app.use(express.json());
app.use(cors());

// Health check endpoint
app.get('/', async (req: Request, res: Response) => {
  const healthStatus = await getHealthStatus(true);
  res.json(healthStatus);
});

app.get('/health', async (req: Request, res: Response) => {
  const healthStatus = await getHealthStatus(false);
  res.json(healthStatus);
});

app.post('/scrape-twitter-profile', async (req: Request, res: Response) => {
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

    const result = await scrapeTwitterProfile(handle);
    return res.json(result);

  } catch (error: any) {
    console.error('Nitter scraping error:', error.message);
    console.error('Stack trace:', error.stack);
    
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
