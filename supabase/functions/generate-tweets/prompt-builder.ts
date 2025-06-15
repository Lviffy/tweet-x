
import { TweetGenerationRequest } from './types.ts';

export function createDetailedPrompt(params: TweetGenerationRequest): string {
  const { topic, tone, format, tweetCount, length, includeHashtags, includeEmojis, includeCTA } = params;
  
  let prompt = `You are an expert Twitter content creator. Generate EXACTLY ${tweetCount} ${format.includes('thread') ? 'complete thread variations' : 'individual tweets'} about: "${topic}"\n\n`;

  // Add tone context
  prompt += `TONE: ${tone} - Write in this specific style and voice.\n\n`;

  // Add length requirements
  let lengthInstructions = '';
  switch (length) {
    case 'short':
      lengthInstructions = 'Keep tweets SHORT and concise (1-2 lines, 80-150 characters). Focus on punchy, impactful statements.';
      break;
    case 'medium':
      lengthInstructions = 'Write MEDIUM length tweets (3-5 lines, 150-220 characters). Provide good detail while staying engaging.';
      break;
    case 'long':
      lengthInstructions = 'Create LONG form tweets (6+ lines, 220-280 characters). Include comprehensive information and context.';
      break;
    default:
      lengthInstructions = 'Write tweets of appropriate length for the content.';
  }
  prompt += `LENGTH: ${lengthInstructions}\n\n`;

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
    prompt += `- Each tweet should offer unique value\n`;
  }

  // Content restrictions - explicitly state what NOT to include
  prompt += `\nCONTENT RESTRICTIONS:\n`;
  if (!includeHashtags) {
    prompt += `- DO NOT include any hashtags in the tweets\n`;
  }
  if (!includeEmojis) {
    prompt += `- DO NOT use any emojis in the tweets\n`;
  }
  if (!includeCTA) {
    prompt += `- DO NOT include calls-to-action or engagement prompts\n`;
  }

  // Only include additional options if they are actually selected
  const enabledOptions: string[] = [];
  if (includeHashtags) enabledOptions.push("Include 2-3 relevant hashtags");
  if (includeEmojis) enabledOptions.push("Use emojis strategically for engagement");
  if (includeCTA) enabledOptions.push("Include compelling calls-to-action");
  
  if (enabledOptions.length > 0) {
    prompt += `\nADDITIONAL OPTIONS:\n- ${enabledOptions.join('\n- ')}\n`;
  }

  prompt += `\nCRITICAL REQUIREMENTS:\n`;
  prompt += `- Output EXACTLY ${tweetCount} ${format.includes('thread') ? 'thread variations' : 'tweets'}\n`;
  prompt += `- Each ${format.includes('thread') ? 'thread' : 'tweet'} must be clearly numbered and separated\n`;
  prompt += `- Stay within Twitter's 280 character limit per tweet\n`;
  prompt += `- Follow the ${length} length guidelines strictly\n`;
  prompt += `- Make content immediately engaging and shareable\n`;
  prompt += `- Follow ALL content restrictions above\n`;
  prompt += `- NO additional commentary or explanations\n\n`;

  prompt += `Begin now with the numbered ${format.includes('thread') ? 'threads' : 'tweets'}:`;

  return prompt;
}
