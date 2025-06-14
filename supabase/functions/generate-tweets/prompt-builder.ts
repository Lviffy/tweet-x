
import { TweetGenerationRequest, ProfileData } from './types.ts';

export function createDetailedPrompt(params: TweetGenerationRequest & { profileData: ProfileData[] }): string {
  const { handles, topic, tone, format, tweetCount, includeHashtags, includeEmojis, includeCTA, profileData } = params;
  
  let prompt = `You are an expert Twitter content creator and analyst. Generate ${tweetCount} high-quality tweets about: "${topic}"\n\n`;

  // Add tone context
  prompt += `Tone: ${tone}\n`;

  // Add detailed profile-specific writing style analysis
  if (profileData && profileData.length > 0) {
    prompt += `\nDETAILED WRITING STYLE ANALYSIS (mimic these exact patterns):\n`;
    
    profileData.forEach((profile: ProfileData) => {
      prompt += `\n@${profile.handle} - Detailed Analysis:\n`;
      
      if (profile.bio) {
        prompt += `- Bio: "${profile.bio}"\n`;
      }
      
      // Enhanced writing style analysis
      if (profile.writing_style_json) {
        const style = profile.writing_style_json;
        if (style.commonStartPhrases && style.commonStartPhrases.length > 0) {
          prompt += `- Tweet Opening Patterns: ${style.commonStartPhrases.join(', ')}\n`;
        }
        if (style.commonEndPhrases && style.commonEndPhrases.length > 0) {
          prompt += `- Tweet Closing Patterns: ${style.commonEndPhrases.join(', ')}\n`;
        }
        if (style.toneKeywords && style.toneKeywords.length > 0) {
          prompt += `- Signature Tone Keywords: ${style.toneKeywords.join(', ')}\n`;
        }
        if (style.questionPatterns) {
          prompt += `- Question Styles: ${style.questionPatterns.join(', ')}\n`;
        }
        if (style.ctaPatterns) {
          prompt += `- Call-to-Action Patterns: ${style.ctaPatterns.join(', ')}\n`;
        }
      }
      
      if (profile.common_phrases && profile.common_phrases.length > 0) {
        prompt += `- Signature Phrases (USE THESE): ${profile.common_phrases.slice(0, 8).join(', ')}\n`;
      }
      
      if (profile.topic_areas && profile.topic_areas.length > 0) {
        prompt += `- Primary Topics: ${profile.topic_areas.slice(0, 5).join(', ')}\n`;
      }
      
      // Detailed metrics for style matching
      prompt += `- Writing Metrics:\n`;
      prompt += `  * Average tweet length: ${profile.average_tweet_length} characters (MATCH THIS LENGTH)\n`;
      prompt += `  * Thread usage: ${profile.thread_percentage}% (${profile.thread_percentage! > 30 ? 'LOVES threads' : 'Prefers single tweets'})\n`;
      prompt += `  * Emoji usage: ${profile.emoji_usage}% (${profile.emoji_usage! > 50 ? 'Emoji-heavy style' : 'Minimal emoji use'})\n`;
      
      // Add engagement patterns
      prompt += `- Engagement Patterns:\n`;
      prompt += `  * Best performing content: Educational threads, product updates, motivational quotes\n`;
      prompt += `  * Engagement style: ${profile.emoji_usage! > 40 ? 'Casual and friendly' : 'Professional and direct'}\n`;
      prompt += `  * Optimal posting time: Morning (7-9 AM) for ${profile.handle}\n`;
      
      // Hook and structure analysis
      prompt += `- Content Structure Patterns:\n`;
      prompt += `  * Hook phrases: "${profile.common_phrases?.[0] || 'Just shipped'}", "${profile.common_phrases?.[1] || 'Quick update'}", "${profile.common_phrases?.[2] || 'Here\'s what I learned'}"\n`;
      prompt += `  * Story structure: ${profile.thread_percentage! > 25 ? 'Often builds narrative across multiple tweets' : 'Delivers complete thoughts in single tweets'}\n`;
      prompt += `  * Call-to-action style: ${profile.emoji_usage! > 30 ? 'Casual with emojis' : 'Direct and actionable'}\n`;
    });
    
    prompt += `\nIMPORTANT STYLE MATCHING RULES:\n`;
    prompt += `1. EXACTLY match the character length patterns (${profileData[0]?.average_tweet_length || 150} chars average)\n`;
    prompt += `2. USE the exact signature phrases provided above naturally in context\n`;
    prompt += `3. MIMIC the emoji usage patterns (${profileData[0]?.emoji_usage || 20}% emoji rate)\n`;
    prompt += `4. COPY the sentence structure and rhythm of their writing\n`;
    prompt += `5. REPLICATE their hook patterns and opening styles\n`;
    prompt += `6. MATCH their call-to-action patterns and engagement style\n`;
  } else {
    prompt += `\nNote: No specific writing style data available. Create engaging tweets in the requested tone.\n`;
  }

  // Enhanced format-specific instructions
  if (format.includes('thread')) {
    const threadLength = parseInt(format.split('-')[1]) || 3;
    prompt += `\nFORMAT: Create ${Math.ceil(tweetCount / threadLength)} thread variations, each with ${threadLength} connected tweets.\n`;
    prompt += `THREAD REQUIREMENTS:\n`;
    prompt += `- Start with strong hook: "🧵 Thread on [topic]:" or use profile's hook patterns\n`;
    prompt += `- Number tweets: "1/${threadLength}", "2/${threadLength}", etc.\n`;
    prompt += `- Each tweet must be complete but connect to narrative\n`;
    prompt += `- Use profile's signature phrases naturally throughout\n`;
    prompt += `- End with strong CTA or question to drive engagement\n`;
  } else {
    prompt += `\nFORMAT: Create ${tweetCount} standalone tweets.\n`;
    prompt += `SINGLE TWEET REQUIREMENTS:\n`;
    prompt += `- Each tweet must be complete, engaging, and actionable\n`;
    prompt += `- Use profile's opening and closing patterns\n`;
    prompt += `- Include signature phrases naturally\n`;
    prompt += `- Match the character length patterns exactly\n`;
  }

  // Enhanced options with style context
  if (includeHashtags) {
    prompt += `- HASHTAGS: Include 2-3 relevant hashtags that match the profile's topic areas\n`;
  }
  if (includeEmojis) {
    prompt += `- EMOJIS: Use emojis strategically (${profileData[0]?.emoji_usage || 30}% rate) matching the profile's style\n`;
  }
  if (includeCTA) {
    prompt += `- CALL-TO-ACTION: Include compelling CTAs using the profile's proven CTA patterns\n`;
  }

  prompt += `\nFINAL QUALITY GUIDELINES:\n`;
  prompt += `- Keep tweets under 280 characters (target: ${profileData[0]?.average_tweet_length || 150} chars)\n`;
  prompt += `- Make each tweet immediately engaging and shareable\n`;
  prompt += `- Use the analyzed signature phrases and hooks EXACTLY as provided\n`;
  prompt += `- Vary sentence structure while maintaining the profile's rhythm\n`;
  prompt += `- Be authentic to the selected writing styles - don't mix different voices\n`;
  prompt += `- Focus on value, engagement, and similarity to analyzed patterns\n`;
  prompt += `- Each tweet should feel like it could have been written by the analyzed profiles\n\n`;

  prompt += `Return ONLY the tweets, numbered, with no additional commentary or explanations.`;

  return prompt;
}
