
import { findChromeExecutable } from './chrome-finder';
import { getWorkingNitterInstance } from '../services/nitter-manager';

export interface HealthStatus {
  status: string;
  service: string;
  timestamp: string;
  chromeExecutable: string;
  nitterInstance: string;
  endpoints?: string[];
  uptime?: number;
}

export async function getHealthStatus(includeEndpoints = false): Promise<HealthStatus> {
  const chromeExecutable = await findChromeExecutable();
  const workingInstance = await getWorkingNitterInstance();
  
  const healthStatus: HealthStatus = {
    status: 'healthy',
    service: 'puppeteer-scraper-nitter',
    timestamp: new Date().toISOString(),
    chromeExecutable: chromeExecutable || 'not found',
    nitterInstance: workingInstance,
  };

  if (includeEndpoints) {
    healthStatus.endpoints = ['/scrape-twitter-profile', '/health'];
  } else {
    healthStatus.uptime = process.uptime();
  }

  return healthStatus;
}
