
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      handles, 
      topic, 
      tone, 
      format, 
      tweetCount, 
      includeHashtags, 
      includeEmojis, 
      includeCTA 
    } = await req.json();

    console.log('Generate tweets request:', { handles, topic, tone, format, tweetCount });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get JWT token from request
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch detailed profile analysis for the selected handles
    const profileData = await getDetailedProfileAnalysis(supabase, user.id, handles);
    
    // Generate enhanced AI prompt with detailed context
    const prompt = createDetailedPrompt({
      handles,
      topic,
      tone,
      format,
      tweetCount,
      includeHashtags,
      includeEmojis,
      includeCTA,
      profileData
    });

    console.log('Enhanced AI prompt created with detailed profile analysis');

    // Call Gemini AI
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.9,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Gemini response received');

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    const tweets = parseTweets(generatedText, format);

    console.log(`Generated ${tweets.length} tweets`);

    return new Response(JSON.stringify({ tweets }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-tweets function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getDetailedProfileAnalysis(supabase: any, userId: string, handles: string[]) {
  if (!handles || handles.length === 0) {
    return [];
  }

  try {
    const { data: profiles, error } = await supabase
      .from('scraped_profiles')
      .select('*')
      .eq('user_id', userId)
      .in('handle', handles);

    if (error) {
      console.error('Error fetching profile data:', error);
      return [];
    }

    return profiles || [];
  } catch (error) {
    console.error('Error in getDetailedProfileAnalysis:', error);
    return [];
  }
}

function createDetailedPrompt({ handles, topic, tone, format, tweetCount, includeHashtags, includeEmojis, includeCTA, profileData }: any) {
  let prompt = `You are an expert Twitter content creator and analyst. Generate ${tweetCount} high-quality tweets about: "${topic}"\n\n`;

  // Add tone context
  prompt += `Tone: ${tone}\n`;

  // Add detailed profile-specific writing style analysis
  if (profileData && profileData.length > 0) {
    prompt += `\nDETAILED WRITING STYLE ANALYSIS (mimic these exact patterns):\n`;
    
    profileData.forEach((profile: any, index: number) => {
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
      prompt += `  * Thread usage: ${profile.thread_percentage}% (${profile.thread_percentage > 30 ? 'LOVES threads' : 'Prefers single tweets'})\n`;
      prompt += `  * Emoji usage: ${profile.emoji_usage}% (${profile.emoji_usage > 50 ? 'Emoji-heavy style' : 'Minimal emoji use'})\n`;
      
      // Add engagement patterns
      prompt += `- Engagement Patterns:\n`;
      prompt += `  * Best performing content: Educational threads, product updates, motivational quotes\n`;
      prompt += `  * Engagement style: ${profile.emoji_usage > 40 ? 'Casual and friendly' : 'Professional and direct'}\n`;
      prompt += `  * Optimal posting time: Morning (7-9 AM) for ${profile.handle}\n`;
      
      // Hook and structure analysis
      prompt += `- Content Structure Patterns:\n`;
      prompt += `  * Hook phrases: "${profile.common_phrases?.[0] || 'Just shipped'}", "${profile.common_phrases?.[1] || 'Quick update'}", "${profile.common_phrases?.[2] || 'Here\'s what I learned'}"\n`;
      prompt += `  * Story structure: ${profile.thread_percentage > 25 ? 'Often builds narrative across multiple tweets' : 'Delivers complete thoughts in single tweets'}\n`;
      prompt += `  * Call-to-action style: ${profile.emoji_usage > 30 ? 'Casual with emojis' : 'Direct and actionable'}\n`;
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

function parseTweets(generatedText: string, format: string): Array<{id: string, content: string, type: 'single' | 'thread'}> {
  const tweets = [];
  const lines = generatedText.split('\n').filter(line => line.trim());
  
  let tweetId = 1;
  
  if (format.includes('thread')) {
    // For threads, group tweets by thread indicators (1/x, 2/x, etc.)
    let currentThread = [];
    
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
