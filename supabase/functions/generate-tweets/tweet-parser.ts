
import { GeneratedTweet } from './types.ts';

export function parseTweets(generatedText: string, format: string): GeneratedTweet[] {
  const tweets: GeneratedTweet[] = [];
  const lines = generatedText.split('\n').filter(line => line.trim());
  
  let tweetId = 1;
  
  if (format.includes('thread')) {
    // For threads, group tweets by thread indicators (1/x, 2/x, etc.)
    let currentThread: string[] = [];
    
    for (const line of lines) {
      const cleanLine = line.replace(/^\d+\.\s*/, '').trim();
      
      if (cleanLine.includes('1/') || cleanLine.includes('🧵')) {
        // Start of new thread
        if (currentThread.length > 0) {
          tweets.push({
            id: `tweet-${tweetId++}`,
            content: currentThread.join('\n\n'),
            type: 'thread' as const
          });
        }
        currentThread = [cleanLine];
      } else if (cleanLine.includes('/')) {
        // Continuation of thread
        currentThread.push(cleanLine);
      } else if (cleanLine.length > 10) {
        // Standalone content, might be part of thread
        if (currentThread.length > 0) {
          currentThread.push(cleanLine);
        } else {
          tweets.push({
            id: `tweet-${tweetId++}`,
            content: cleanLine,
            type: 'single' as const
          });
        }
      }
    }
    
    // Add the last thread if exists
    if (currentThread.length > 0) {
      tweets.push({
        id: `tweet-${tweetId++}`,
        content: currentThread.join('\n\n'),
        type: 'thread' as const
      });
    }
  } else {
    // For single tweets
    for (const line of lines) {
      const cleanLine = line.replace(/^\d+\.\s*/, '').trim();
      if (cleanLine.length > 10) {
        tweets.push({
          id: `tweet-${tweetId++}`,
          content: cleanLine,
          type: 'single' as const
        });
      }
    }
  }
  
  return tweets;
}
