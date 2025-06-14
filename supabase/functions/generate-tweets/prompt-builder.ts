
import { TweetGenerationRequest, ProfileData } from './types.ts';

export function createDetailedPrompt(params: TweetGenerationRequest & { profileData: ProfileData[] }): string {
  const { handles, topic, tone, format, tweetCount, includeHashtags, includeEmojis, includeCTA, profileData } = params;
  
  let prompt = `You are an expert Twitter content creator and analyst. Generate EXACTLY ${tweetCount} ${format.includes('thread') ? 'thread variations' : 'individual tweets'} about: "${topic}"\n\n`;

  // Add tone context
  prompt += `Tone: ${tone}\n`;

  // Handle profile-specific writing style analysis only if profiles are provided
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
    prompt += `\nGENERAL WRITING STYLE GUIDELINES:\n`;
    prompt += `Create original, engaging tweets in the "${tone}" tone without mimicking any specific writing style.\n`;
    prompt += `Focus on clear, compelling content that matches the specified tone and topic.\n`;
    prompt += `Use natural, authentic language appropriate for the chosen tone.\n`;
  }

  // Enhanced format-specific instructions
  if (format.includes('thread')) {
    const threadLength = parseInt(format.split('-')[1]) || 3;
    prompt += `\nFORMAT: Create EXACTLY ${tweetCount} thread variations, each with ${threadLength} connected tweets.\n`;
    prompt += `THREAD REQUIREMENTS:\n`;
    prompt += `- Each thread variation should be numbered (Thread 1, Thread 2, etc.)\n`;
    prompt += `- Start each thread with strong hook: "🧵 Thread on [topic]:" or similar engaging opener\n`;
    prompt += `- Number tweets within each thread: "1/${threadLength}", "2/${threadLength}", etc.\n`;
    prompt += `- Each tweet must be complete but connect to narrative\n`;
    if (profileData && profileData.length > 0) {
      prompt += `- Use profile's signature phrases naturally throughout\n`;
    }
    prompt += `- End each thread with strong CTA or question to drive engagement\n`;
    prompt += `- Separate each thread variation clearly\n`;
  } else {
    prompt += `\nFORMAT: Create EXACTLY ${tweetCount} standalone tweets.\n`;
    prompt += `SINGLE TWEET REQUIREMENTS:\n`;
    prompt += `- Number each tweet clearly (Tweet 1, Tweet 2, etc.)\n`;
    prompt += `- Each tweet must be complete, engaging, and actionable\n`;
    if (profileData && profileData.length > 0) {
      prompt += `- Use profile's opening and closing patterns\n`;
      prompt += `- Include signature phrases naturally\n`;
      prompt += `- Match the character length patterns exactly\n`;
    } else {
      prompt += `- Keep tweets concise and impactful (aim for 150-250 characters)\n`;
      prompt += `- Use engaging hooks and clear calls-to-action\n`;
    }
    prompt += `- Each tweet should be unique and offer different value\n`;
  }

  // Enhanced options with style context
  if (includeHashtags) {
    const hashtagGuidance = profileData && profileData.length > 0 
      ? `Include 2-3 relevant hashtags that match the profile's topic areas` 
      : `Include 2-3 relevant hashtags related to the topic and tone`;
    prompt += `- HASHTAGS: ${hashtagGuidance}\n`;
  }
  if (includeEmojis) {
    const emojiGuidance = profileData && profileData.length > 0 
      ? `Use emojis strategically (${profileData[0]?.emoji_usage || 30}% rate) matching the profile's style` 
      : `Use emojis strategically to enhance engagement and tone`;
    prompt += `- EMOJIS: ${emojiGuidance}\n`;
  }
  if (includeCTA) {
    const ctaGuidance = profileData && profileData.length > 0 
      ? `Include compelling CTAs using the profile's proven CTA patterns` 
      : `Include compelling calls-to-action appropriate for the tone and topic`;
    prompt += `- CALL-TO-ACTION: ${ctaGuidance}\n`;
  }

  prompt += `\nFINAL QUALITY GUIDELINES:\n`;
  prompt += `- Keep individual tweets under 280 characters\n`;
  prompt += `- Make each ${format.includes('thread') ? 'thread variation' : 'tweet'} immediately engaging and shareable\n`;
  prompt += `- CRITICAL: You must generate EXACTLY ${tweetCount} ${format.includes('thread') ? 'thread variations' : 'tweets'}, no more, no less\n`;
  if (profileData && profileData.length > 0) {
    prompt += `- Use the analyzed signature phrases and hooks EXACTLY as provided\n`;
    prompt += `- Vary sentence structure while maintaining the profile's rhythm\n`;
    prompt += `- Be authentic to the selected writing styles - don't mix different voices\n`;
    prompt += `- Each ${format.includes('thread') ? 'thread' : 'tweet'} should feel like it could have been written by the analyzed profiles\n`;
  } else {
    prompt += `- Create original, authentic content in the specified tone\n`;
    prompt += `- Vary sentence structure while maintaining consistency\n`;
    prompt += `- Focus on value, engagement, and clarity\n`;
    prompt += `- Each ${format.includes('thread') ? 'thread' : 'tweet'} should be memorable and shareable\n`;
  }
  prompt += `- Focus on value, engagement, and similarity to analyzed patterns\n\n`;

  prompt += `Return ONLY the ${tweetCount} ${format.includes('thread') ? 'thread variations' : 'tweets'}, clearly numbered and formatted, with no additional commentary or explanations.`;

  return prompt;
}
