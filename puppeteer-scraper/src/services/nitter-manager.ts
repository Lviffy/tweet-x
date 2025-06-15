
// Nitter instances for load balancing and redundancy
const NITTER_INSTANCES = [
  'https://nitter.net',
  'https://nitter.it',
  'https://nitter.privacydev.net',
  'https://nitter.unixfox.eu',
  'https://nitter.domain.glass'
];

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
export async function getWorkingNitterInstance(): Promise<string> {
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
