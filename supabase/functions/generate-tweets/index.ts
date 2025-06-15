
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateUser } from './auth.ts';
import { createDetailedPrompt } from './prompt-builder.ts';
import { callGeminiAI } from './ai-service.ts';
import { parseTweets } from './tweet-parser.ts';
import { TweetGenerationRequest } from './types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Validate required fields
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

    // Authenticate user
    const authHeader = req.headers.get('authorization');
    const { user, supabase } = await authenticateUser(authHeader);
    
    // Generate AI prompt with length parameter
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

    // Call Gemini AI
    const generatedText = await callGeminiAI(prompt);
    
    if (!generatedText?.trim()) {
      throw new Error('AI generated empty response');
    }
    
    // Parse tweets with proper format and count handling
    const tweets = parseTweets(generatedText, format || 'single', tweetCount);

    console.log(`Successfully generated ${tweets.length} tweets (requested: ${tweetCount})`);

    // Ensure we have the requested number of tweets
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
