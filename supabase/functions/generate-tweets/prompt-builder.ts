
import { TweetGenerationRequest } from './types.ts';

export function createDetailedPrompt(params: TweetGenerationRequest): string {
  const { topic, tone, format, tweetCount, length, includeHashtags, includeEmojis, includeCTA } = params;
  
  let prompt = `You are an expert Twitter content creator who writes AUTHENTIC, HUMAN tweets that sound natural and conversational. Generate EXACTLY ${tweetCount} ${format.includes('thread') ? 'complete thread variations' : 'individual tweets'} about: "${topic}"\n\n`;

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

  // Critical human-like writing instructions
  prompt += `WRITING STYLE REQUIREMENTS:\n`;
  prompt += `- Write like a REAL PERSON, not an AI assistant\n`;
  prompt += `- Use natural, conversational language with personality\n`;
  prompt += `- Include personal experiences, opinions, and emotions\n`;
  prompt += `- Use contractions (I'm, don't, can't, won't, it's, etc.)\n`;
  prompt += `- Add hesitations and human imperfections (honestly, tbh, ngl, etc.)\n`;
  prompt += `- Avoid corporate speak and buzzwords\n`;
  prompt += `- NO generic advice or clichés\n`;
  prompt += `- NO "Here's how to..." or "Tips for..." beginnings\n`;
  prompt += `- NO lists with bullet points or numbered items\n`;
  prompt += `- Use specific examples and personal anecdotes\n`;
  prompt += `- Show vulnerability and authenticity\n`;
  prompt += `- Write with conviction and strong opinions\n\n`;

  // Format-specific instructions
  if (format.includes('thread')) {
    const threadLength = parseInt(format.split('-')[1]) || 3;
    prompt += `\nFORMAT REQUIREMENTS:\n`;
    prompt += `- Create EXACTLY ${tweetCount} separate thread variations\n`;
    prompt += `- Each thread must have exactly ${threadLength} tweets\n`;
    prompt += `- Number each thread: "Thread 1:", "Thread 2:", etc.\n`;
    prompt += `- Number tweets within threads: "1/${threadLength}", "2/${threadLength}", etc.\n`;
    prompt += `- Start each thread with a personal hook or story\n`;
    prompt += `- End each thread with a personal reflection or question\n`;
    prompt += `- Make each tweet in the thread flow naturally to the next\n`;
    prompt += `- Separate each thread clearly with a blank line\n`;
  } else {
    prompt += `\nFORMAT REQUIREMENTS:\n`;
    prompt += `- Create EXACTLY ${tweetCount} standalone tweets\n`;
    prompt += `- Number each tweet: "Tweet 1:", "Tweet 2:", etc.\n`;
    prompt += `- Each tweet must be complete and engaging\n`;
    prompt += `- Each tweet should offer unique value or perspective\n`;
    prompt += `- Vary the voice and approach for each tweet\n`;
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
  if (includeHashtags) enabledOptions.push("Include 2-3 relevant hashtags naturally");
  if (includeEmojis) enabledOptions.push("Use emojis sparingly and naturally");
  if (includeCTA) enabledOptions.push("Include subtle, natural engagement");
  
  if (enabledOptions.length > 0) {
    prompt += `\nADDITIONAL OPTIONS:\n- ${enabledOptions.join('\n- ')}\n`;
  }

  // Specific anti-AI patterns
  prompt += `\nAVOID THESE AI PATTERNS:\n`;
  prompt += `- Starting with "I'm excited to share..."\n`;
  prompt += `- Using "Let's dive in" or "Let me break this down"\n`;
  prompt += `- Ending with "What do you think?" or "Thoughts?"\n`;
  prompt += `- Using "Here are X ways..." structures\n`;
  prompt += `- Generic motivational language\n`;
  prompt += `- Perfect grammar and formal structure\n`;
  prompt += `- Overly positive or enthusiastic tone\n`;
  prompt += `- Corporate jargon or business speak\n\n`;

  prompt += `CRITICAL REQUIREMENTS:\n`;
  prompt += `- Output EXACTLY ${tweetCount} ${format.includes('thread') ? 'thread variations' : 'tweets'}\n`;
  prompt += `- Each ${format.includes('thread') ? 'thread' : 'tweet'} must be clearly numbered and separated\n`;
  prompt += `- Stay within Twitter's 280 character limit per tweet\n`;
  prompt += `- Follow the ${length} length guidelines strictly\n`;
  prompt += `- Make content sound like it came from a real person with real experiences\n`;
  prompt += `- Follow ALL content restrictions above\n`;
  prompt += `- NO additional commentary or explanations\n\n`;

  prompt += `Begin now with the numbered ${format.includes('thread') ? 'threads' : 'tweets'} that sound completely human and authentic:`;

  return prompt;
}
