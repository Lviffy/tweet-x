
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

    // Fetch scraped profile data for the selected handles
    const profileData = await getProfileAnalysis(supabase, user.id, handles);
    
    // Generate AI prompt with enhanced context
    const prompt = createEnhancedPrompt({
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

    console.log('Enhanced AI prompt created with profile analysis');

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

async function getProfileAnalysis(supabase: any, userId: string, handles: string[]) {
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
    console.error('Error in getProfileAnalysis:', error);
    return [];
  }
}

function createEnhancedPrompt({ handles, topic, tone, format, tweetCount, includeHashtags, includeEmojis, includeCTA, profileData }: any) {
  let prompt = `You are an expert Twitter content creator. Generate ${tweetCount} high-quality tweets about: "${topic}"\n\n`;

  // Add tone context
  prompt += `Tone: ${tone}\n`;

  // Add profile-specific writing style analysis
  if (profileData && profileData.length > 0) {
    prompt += `\nWriting Style Analysis (mimic these patterns):\n`;
    
    profileData.forEach((profile: any, index: number) => {
      prompt += `\n@${profile.handle}:\n`;
      
      if (profile.bio) {
        prompt += `- Bio: "${profile.bio}"\n`;
      }
      
      if (profile.writing_style_json) {
        const style = profile.writing_style_json;
        if (style.commonStartPhrases && style.commonStartPhrases.length > 0) {
          prompt += `- Often starts tweets with: ${style.commonStartPhrases.join(', ')}\n`;
        }
        if (style.commonEndPhrases && style.commonEndPhrases.length > 0) {
          prompt += `- Often ends tweets with: ${style.commonEndPhrases.join(', ')}\n`;
        }
        if (style.toneKeywords && style.toneKeywords.length > 0) {
          prompt += `- Tone keywords: ${style.toneKeywords.join(', ')}\n`;
        }
      }
      
      if (profile.common_phrases && profile.common_phrases.length > 0) {
        prompt += `- Common phrases: ${profile.common_phrases.slice(0, 5).join(', ')}\n`;
      }
      
      if (profile.topic_areas && profile.topic_areas.length > 0) {
        prompt += `- Topics they discuss: ${profile.topic_areas.join(', ')}\n`;
      }
      
      prompt += `- Average tweet length: ${profile.average_tweet_length} characters\n`;
      prompt += `- Uses threads ${profile.thread_percentage}% of the time\n`;
      prompt += `- Uses emojis ${profile.emoji_usage}% of the time\n`;
    });
    
    prompt += `\nIMPORTANT: Blend the writing styles of these ${profileData.length} accounts. Use their common phrases, sentence structures, and tone patterns naturally.\n`;
  } else {
    prompt += `\nNote: No specific writing style data available. Create engaging tweets in the requested tone.\n`;
  }

  // Format-specific instructions
  if (format.includes('thread')) {
    const threadLength = parseInt(format.split('-')[1]) || 3;
    prompt += `\nFormat: Create ${Math.ceil(tweetCount / threadLength)} thread variations, each with ${threadLength} connected tweets. Each thread should:\n`;
    prompt += `- Start with "1/${threadLength}" and continue "2/${threadLength}", etc.\n`;
    prompt += `- Tell a complete story or make a complete argument\n`;
    prompt += `- Each tweet should be engaging on its own but connect to the narrative\n`;
  } else {
    prompt += `\nFormat: Create ${tweetCount} standalone tweets. Each should be complete and engaging on its own.\n`;
  }

  // Additional options
  if (includeHashtags) {
    prompt += `- Include relevant hashtags (2-3 max per tweet)\n`;
  }
  if (includeEmojis) {
    prompt += `- Use emojis strategically to enhance engagement\n`;
  }
  if (includeCTA) {
    prompt += `- Include compelling calls-to-action where appropriate\n`;
  }

  prompt += `\nGuidelines:
- Keep tweets under 280 characters
- Make each tweet engaging and shareable
- Use the analyzed writing patterns naturally
- Vary sentence structure and length
- Be authentic to the selected writing styles
- Focus on value and engagement over perfection

Return ONLY the tweets, numbered, with no additional commentary.`;

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
      
      if (cleanLine.includes('1/')) {
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
