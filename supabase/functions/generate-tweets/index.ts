
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

// Types
interface GeneratedTweet {
  id: string;
  content: string;
  type: 'single' | 'thread';
}

interface TweetGenerationRequest {
  handles?: string[];
  topic: string;
  tone: string;
  format: string;
  tweetCount: number;
  length: string;
  includeHashtags: boolean;
  includeEmojis: boolean;
  includeCTA: boolean;
}

// CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Authentication helper
async function authenticateUser(authHeader: string | null) {
  if (!authHeader) {
    throw new Error('No authorization header');
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: { user }, error: userError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  );

  if (userError || !user) {
    throw new Error('Unauthorized');
  }

  return { user, supabase };
}

// AI Service
async function callGeminiAI(prompt: string): Promise<string> {
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

  return data.candidates[0].content.parts[0].text;
}

// Prompt Builder
function createDetailedPrompt(params: TweetGenerationRequest): string {
  const { topic, tone, format, tweetCount, length, includeHashtags, includeEmojis, includeCTA } = params;
  
  let prompt = `You are an expert Twitter content creator. Generate EXACTLY ${tweetCount} ${format.includes('thread') ? 'complete thread variations' : 'individual tweets'} about: "${topic}"\n\n`;

  prompt += `TONE: ${tone} - Write in this specific style and voice.\n\n`;

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

// Tweet Parser
function parseTweets(generatedText: string, format: string, requestedCount: number): GeneratedTweet[] {
  const tweets: GeneratedTweet[] = [];
  const lines = generatedText.split('\n').filter(line => line.trim());
  
  console.log(`Parsing tweets - Format: ${format}, Requested count: ${requestedCount}`);
  console.log(`Generated text lines: ${lines.length}`);
  
  let tweetId = 1;
  
  if (format.includes('thread')) {
    let currentThread: string[] = [];
    let threadCount = 0;
    
    for (const line of lines) {
      const cleanLine = line.replace(/^\d+\.\s*/, '').replace(/^(Thread \d+:?\s*|Tweet \d+:?\s*)/i, '').trim();
      
      if (cleanLine.length < 10) continue;
      
      if (cleanLine.match(/^1\/\d+/) || cleanLine.toLowerCase().includes('thread') || 
          cleanLine.includes('🧵') || cleanLine.match(/^Thread \d+/i)) {
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
        currentThread.push(cleanLine);
      } else if (threadCount < requestedCount) {
        currentThread = [cleanLine];
      }
    }
    
    if (currentThread.length > 0 && threadCount < requestedCount) {
      tweets.push({
        id: `thread-${tweetId++}`,
        content: currentThread.join('\n\n'),
        type: 'thread' as const
      });
      threadCount++;
    }
    
    while (tweets.length < requestedCount && lines.length > 0) {
      const startIdx = tweets.length * 3;
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
    let processedCount = 0;
    
    for (const line of lines) {
      if (processedCount >= requestedCount) break;
      
      const cleanLine = line.replace(/^\d+\.\s*/, '')
                           .replace(/^(Tweet \d+:?\s*|Variation \d+:?\s*)/i, '')
                           .trim();
      
      if (cleanLine.length < 20) continue;
      
      tweets.push({
        id: `tweet-${tweetId++}`,
        content: cleanLine,
        type: 'single' as const
      });
      processedCount++;
    }
    
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
  return tweets.slice(0, requestedCount);
}

// Main function
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: TweetGenerationRequest = await req.json();
    const { 
      handles = [],
      topic, 
      tone, 
      format, 
      tweetCount,
      length,
      includeHashtags, 
      includeEmojis, 
      includeCTA 
    } = requestData;

    console.log('Generate tweets request:', { 
      topic: topic?.substring(0, 50) + '...', 
      tone, 
      format, 
      tweetCount,
      length
    });

    if (!topic?.trim()) {
      throw new Error('Topic is required');
    }
    if (!tone?.trim()) {
      throw new Error('Tone is required');
    }
    if (!tweetCount || tweetCount < 1 || tweetCount > 10) {
      throw new Error('Tweet count must be between 1 and 10');
    }
    if (!length || !['short', 'medium', 'long'].includes(length)) {
      throw new Error('Valid length is required (short, medium, or long)');
    }

    const authHeader = req.headers.get('authorization');
    const { user, supabase } = await authenticateUser(authHeader);
    
    const prompt = createDetailedPrompt({
      topic,
      tone,
      format: format || 'single',
      tweetCount,
      length,
      includeHashtags: includeHashtags || false,
      includeEmojis: includeEmojis || false,
      includeCTA: includeCTA || false
    });

    console.log('AI prompt created, calling Gemini...');

    const generatedText = await callGeminiAI(prompt);
    
    if (!generatedText?.trim()) {
      throw new Error('AI generated empty response');
    }
    
    const tweets = parseTweets(generatedText, format || 'single', tweetCount);

    console.log(`Successfully generated ${tweets.length} tweets (requested: ${tweetCount})`);

    if (tweets.length === 0) {
      throw new Error('Failed to parse any tweets from AI response');
    }

    return new Response(JSON.stringify({ tweets }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-tweets function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      details: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
