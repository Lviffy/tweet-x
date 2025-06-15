
import { TweetGenerationRequest } from './types.ts';

export function createDetailedPrompt(params: TweetGenerationRequest): string {
  const { topic, tone, format, tweetCount, includeHashtags, includeEmojis, includeCTA } = params;
  
  let prompt = `You are an expert Twitter content creator. Generate EXACTLY ${tweetCount} ${format.includes('thread') ? 'complete thread variations' : 'individual tweets'} about: "${topic}"\n\n`;

  // Add tone context
  prompt += `TONE: ${tone} - Write in this specific style and voice.\n\n`;

  // Format-specific instructions
  if (format.includes('thread')) {
    const threadLength = parseInt(format.split('-')[1]) || 3;
    prompt += `\nFORMAT REQUIREMENTS:\n`;
    prompt += `- Create EXACTLY ${tweetCount} separate thread variations\n`;
    prompt += `- Each thread must have exactly ${threadLength} tweets\n`;
    prompt += `- Number each thread: "Thread 1:", "Thread 2:", etc.\n`;
    prompt += `- Number tweets within threads: "1/${threadLength}", "2/${threadLength}", etc.\n`;
    prompt += `- Start each thread with a strong hook\n`;
    prompt += `- End each thread with engagement (question/CTA)\n`;
    prompt += `- Separate each thread clearly with a blank line\n`;
  } else {
    prompt += `\nFORMAT REQUIREMENTS:\n`;
    prompt += `- Create EXACTLY ${tweetCount} standalone tweets\n`;
    prompt += `- Number each tweet: "Tweet 1:", "Tweet 2:", etc.\n`;
    prompt += `- Each tweet must be complete and engaging\n`;
    prompt += `- Keep tweets between 150-280 characters\n`;
    prompt += `- Each tweet should offer unique value\n`;
  }

  // Additional options
  const options: string[] = [];
  if (includeHashtags) options.push("Include 2-3 relevant hashtags");
  if (includeEmojis) options.push("Use emojis strategically for engagement");
  if (includeCTA) options.push("Include compelling calls-to-action");
  
  if (options.length > 0) {
    prompt += `\nADDITIONAL OPTIONS:\n- ${options.join('\n- ')}\n`;
  }

  prompt += `\nCRITICAL REQUIREMENTS:\n`;
  prompt += `- Output EXACTLY ${tweetCount} ${format.includes('thread') ? 'thread variations' : 'tweets'}\n`;
  prompt += `- Each ${format.includes('thread') ? 'thread' : 'tweet'} must be clearly numbered and separated\n`;
  prompt += `- Stay within Twitter's 280 character limit per tweet\n`;
  prompt += `- Make content immediately engaging and shareable\n`;
  prompt += `- NO additional commentary or explanations\n\n`;

  prompt += `Begin now with the numbered ${format.includes('thread') ? 'threads' : 'tweets'}:`;

  return prompt;
}
