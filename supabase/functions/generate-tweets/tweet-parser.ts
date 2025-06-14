
import { GeneratedTweet } from './types.ts';

export function parseTweets(generatedText: string, format: string, requestedCount: number): GeneratedTweet[] {
  const tweets: GeneratedTweet[] = [];
  const lines = generatedText.split('\n').filter(line => line.trim());
  
  let tweetId = 1;
  
  if (format.includes('thread')) {
    // For threads, each thread counts as one "tweet" but contains multiple parts
    const threadLength = parseInt(format.split('-')[1]) || 3;
    let currentThread: string[] = [];
    let threadCount = 0;
    
    for (const line of lines) {
      const cleanLine = line.replace(/^\d+\.\s*/, '').trim();
      
      // Check if this is a thread indicator (1/3, 2/3, etc.) or thread start
      if (cleanLine.match(/^1\/\d+/) || cleanLine.includes('🧵') || cleanLine.toLowerCase().includes('thread')) {
        // Start of new thread
        if (currentThread.length > 0 && threadCount < requestedCount) {
          tweets.push({
            id: `thread-${tweetId++}`,
            content: currentThread.join('\n\n'),
            type: 'thread' as const
          });
          threadCount++;
        }
        currentThread = [cleanLine];
      } else if (cleanLine.match(/^\d+\/\d+/)) {
        // Continuation of thread (2/3, 3/3, etc.)
        if (currentThread.length > 0) {
          currentThread.push(cleanLine);
        }
      } else if (cleanLine.length > 10 && !cleanLine.match(/^(tweet|variation|\d+\.)/i)) {
        // Regular content line
        if (currentThread.length > 0) {
          currentThread.push(cleanLine);
        } else if (threadCount < requestedCount) {
          // Start a new thread if we haven't reached the limit
          currentThread = [cleanLine];
        }
      }
    }
    
    // Add the last thread if exists and we haven't reached the limit
    if (currentThread.length > 0 && threadCount < requestedCount) {
      tweets.push({
        id: `thread-${tweetId++}`,
        content: currentThread.join('\n\n'),
        type: 'thread' as const
      });
    }
    
    // If we don't have enough threads, split the content differently
    if (tweets.length < requestedCount && lines.length > 0) {
      const remainingLines = lines.filter(line => {
        const cleanLine = line.replace(/^\d+\.\s*/, '').trim();
        return cleanLine.length > 10;
      });
      
      // Group remaining lines into threads
      const linesPerThread = Math.ceil(remainingLines.length / (requestedCount - tweets.length));
      for (let i = tweets.length; i < requestedCount && i * linesPerThread < remainingLines.length; i++) {
        const threadLines = remainingLines.slice(i * linesPerThread, (i + 1) * linesPerThread);
        if (threadLines.length > 0) {
          tweets.push({
            id: `thread-${tweetId++}`,
            content: threadLines.join('\n\n'),
            type: 'thread' as const
          });
        }
      }
    }
  } else {
    // For single tweets, each line/paragraph should be a separate tweet
    let processedCount = 0;
    
    for (const line of lines) {
      const cleanLine = line.replace(/^\d+\.\s*/, '').replace(/^tweet\s*\d*:?\s*/i, '').trim();
      
      if (cleanLine.length > 10 && processedCount < requestedCount) {
        tweets.push({
          id: `tweet-${tweetId++}`,
          content: cleanLine,
          type: 'single' as const
        });
        processedCount++;
      }
    }
    
    // If we still don't have enough tweets, split longer content
    if (tweets.length < requestedCount && generatedText.trim()) {
      const sentences = generatedText.split(/[.!?]+/).filter(s => s.trim().length > 20);
      
      for (let i = tweets.length; i < requestedCount && i < sentences.length; i++) {
        tweets.push({
          id: `tweet-${tweetId++}`,
          content: sentences[i].trim() + (sentences[i].includes('.') ? '' : '.'),
          type: 'single' as const
        });
      }
    }
  }
  
  return tweets;
}
