
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateUser } from './auth.ts';
import { getDetailedProfileAnalysis } from './profile-analyzer.ts';
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
      handles, 
      topic, 
      tone, 
      format, 
      tweetCount, 
      includeHashtags, 
      includeEmojis, 
      includeCTA 
    } = requestData;

    console.log('Generate tweets request:', { handles, topic, tone, format, tweetCount });

    // Authenticate user
    const authHeader = req.headers.get('authorization');
    const { user, supabase } = await authenticateUser(authHeader);

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
    const generatedText = await callGeminiAI(prompt);
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
