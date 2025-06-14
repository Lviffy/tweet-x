
import { GeneratedTweet } from './types.ts';

export function parseTweets(generatedText: string, format: string, requestedCount: number): GeneratedTweet[] {
  const tweets: GeneratedTweet[] = [];
  const lines = generatedText.split('\n').filter(line => line.trim());
  
  console.log(`Parsing tweets - Format: ${format}, Requested count: ${requestedCount}`);
  console.log(`Generated text lines: ${lines.length}`);
  
  let tweetId = 1;
  
  if (format.includes('thread')) {
    // For threads, parse each complete thread as one unit
    let currentThread: string[] = [];
    let threadCount = 0;
    
    for (const line of lines) {
      const cleanLine = line.replace(/^\d+\.\s*/, '').replace(/^(Thread \d+:?\s*|Tweet \d+:?\s*)/i, '').trim();
      
      // Skip empty lines or very short content
      if (cleanLine.length < 10) continue;
      
      // Check if this starts a new thread
      if (cleanLine.match(/^1\/\d+/) || cleanLine.toLowerCase().includes('thread') || 
          cleanLine.includes('🧵') || cleanLine.match(/^Thread \d+/i)) {
        // Save previous thread if it exists
        if (currentThread.length > 0 && threadCount < requestedCount) {
          tweets.push({
            id: `thread-${tweetId++}`,
            content: currentThread.join('\n\n'),
            type: 'thread' as const
          });
          threadCount++;
        }
        currentThread = [cleanLine];
      } else if (cleanLine.match(/^\d+\/\d+/) || currentThread.length > 0) {
        // Continue current thread
        currentThread.push(cleanLine);
      } else if (threadCount < requestedCount) {
        // Start new thread with this line
        currentThread = [cleanLine];
      }
    }
    
    // Add the last thread
    if (currentThread.length > 0 && threadCount < requestedCount) {
      tweets.push({
        id: `thread-${tweetId++}`,
        content: currentThread.join('\n\n'),
        type: 'thread' as const
      });
      threadCount++;
    }
    
    // If we still don't have enough threads, create them from remaining content
    while (tweets.length < requestedCount && lines.length > 0) {
      const startIdx = tweets.length * 3; // Assume 3 tweets per thread
      const endIdx = startIdx + 3;
      const threadLines = lines.slice(startIdx, endIdx).filter(line => {
        const clean = line.replace(/^\d+\.\s*/, '').trim();
        return clean.length > 10;
      });
      
      if (threadLines.length > 0) {
        tweets.push({
          id: `thread-${tweetId++}`,
          content: threadLines.join('\n\n'),
          type: 'thread' as const
        });
      } else {
        break;
      }
    }
  } else {
    // For single tweets
    let processedCount = 0;
    
    for (const line of lines) {
      if (processedCount >= requestedCount) break;
      
      const cleanLine = line.replace(/^\d+\.\s*/, '')
                           .replace(/^(Tweet \d+:?\s*|Variation \d+:?\s*)/i, '')
                           .trim();
      
      // Skip empty or too short lines
      if (cleanLine.length < 20) continue;
      
      tweets.push({
        id: `tweet-${tweetId++}`,
        content: cleanLine,
        type: 'single' as const
      });
      processedCount++;
    }
    
    // If we don't have enough tweets, try to extract more from the content
    if (tweets.length < requestedCount) {
      const allText = generatedText.replace(/^\d+\.\s*/gm, '').trim();
      const sentences = allText.split(/[.!?]+/).filter(s => s.trim().length > 30);
      
      for (let i = tweets.length; i < requestedCount && i < sentences.length; i++) {
        const sentence = sentences[i].trim();
        if (sentence.length > 20) {
          tweets.push({
            id: `tweet-${tweetId++}`,
            content: sentence + (sentence.endsWith('.') ? '' : '.'),
            type: 'single' as const
          });
        }
      }
    }
  }
  
  console.log(`Parsed ${tweets.length} tweets of type ${format}`);
  return tweets.slice(0, requestedCount); // Ensure we don't exceed requested count
}
