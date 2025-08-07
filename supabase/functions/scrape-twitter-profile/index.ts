
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Updated to use your correct deployed URL
async function fetchPuppeteerProfile(handle: string): Promise<any> {
  // Use your actual deployed URL from Render
  const apiUrl = 'https://puppeteer-scraper-lxo7.onrender.com';
  const apiKey = Deno.env.get('PUPPETEER_API_KEY') || null; // Optional

  console.log('Calling Puppeteer API at:', `${apiUrl}/scrape-twitter-profile`);

  // First, let's check if the service is healthy
  try {
    console.log('Checking service health...');
    const healthResponse = await fetch(`${apiUrl}/health`);
    console.log('Health check status:', healthResponse.status);
    if (healthResponse.ok) {
      const healthData = await healthResponse.text();
      console.log('Health check response:', healthData);
    }
  } catch (healthError) {
    console.error('Health check failed:', healthError);
  }

  const response = await fetch(`${apiUrl}/scrape-twitter-profile`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { 'x-api-key': apiKey } : {}),
    },
    body: JSON.stringify({ handle }),
  });
  
  console.log('Puppeteer API response status:', response.status);
  console.log('Puppeteer API response headers:', Object.fromEntries(response.headers.entries()));
  
  if (!response.ok) {
    const errText = await response.text();
    console.error('Puppeteer API response:', response.status, errText);
    throw new Error(`Puppeteer API failed: ${response.status} - ${errText}`);
  }
  
  return await response.json();
}

function analyzeContent(tweets: any[]): any {
  const texts = tweets.map(t => t.text);
  
  // Analyze writing style with more detail
  const sentences = texts.join(' ').split(/[.!?]+/).filter(s => s.trim().length > 0);
  const averageWordsPerSentence = sentences.length > 0 
    ? Math.round(sentences.reduce((acc, s) => acc + s.trim().split(/\s+/).length, 0) / sentences.length)
    : 0;
  
  // Find common starting phrases
  const startPhrases = tweets.map(t => {
    const words = t.text.trim().split(/\s+/);
    if (words.length >= 2) {
      return words.slice(0, 2).join(' ');
    }
    return words[0] || '';
  }).filter(phrase => phrase.length > 0);
  const commonStartPhrases = findMostCommon(startPhrases, 5);
  
  // Find common ending phrases
  const endPhrases = tweets.map(t => {
    const words = t.text.trim().split(/\s+/);
    if (words.length >= 2) {
      return words.slice(-2).join(' ');
    }
    return words[words.length - 1] || '';
  }).filter(phrase => phrase.length > 0);
  const commonEndPhrases = findMostCommon(endPhrases, 5);
  
  // Extract common phrases (2-3 word combinations)
  const allWords = texts.join(' ').toLowerCase().split(/\s+/);
  const phrases: string[] = [];
  for (let i = 0; i < allWords.length - 1; i++) {
    if (allWords[i].length > 2 && allWords[i + 1].length > 2) {
      phrases.push(`${allWords[i]} ${allWords[i + 1]}`);
    }
  }
  const commonPhrases = findMostCommon(phrases, 15);
  
  // Enhanced topic analysis
  const topicKeywords = [
    'startup', 'build', 'product', 'business', 'growth', 'tech', 'ai', 'coding', 
    'marketing', 'fundraising', 'founder', 'entrepreneur', 'innovation', 'remote',
    'productivity', 'design', 'development', 'launch', 'mvp', 'feedback'
  ];
  const topicAreas = topicKeywords.filter(keyword => 
    texts.some(text => text.toLowerCase().includes(keyword))
  );
  
  // Calculate metrics
  const averageTweetLength = tweets.length > 0 
    ? Math.round(tweets.reduce((acc, t) => acc + t.length, 0) / tweets.length)
    : 0;
  const threadCount = tweets.filter(t => t.isThread).length;
  const threadPercentage = tweets.length > 0 ? Math.round((threadCount / tweets.length) * 100) : 0;
  const emojiCount = tweets.filter(t => t.hasEmojis).length;
  const emojiUsage = tweets.length > 0 ? Math.round((emojiCount / tweets.length) * 100) : 0;
  
  return {
    writingStyle: {
      averageWordsPerSentence,
      commonStartPhrases,
      commonEndPhrases,
      sentencePatterns: ['declarative', 'conversational', 'direct'],
      toneKeywords: ['authentic', 'helpful', 'insightful', 'practical']
    },
    commonPhrases,
    topicAreas,
    averageTweetLength,
    threadPercentage,
    emojiUsage
  };
}

function findMostCommon(items: string[], limit: number): string[] {
  const frequency: { [key: string]: number } = {};
  items.forEach(item => {
    const cleanItem = item.trim().toLowerCase();
    if (cleanItem.length > 0) {
      frequency[cleanItem] = (frequency[cleanItem] || 0) + 1;
    }
  });
  
  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([item]) => item);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { handle } = await req.json();

    if (!handle) {
      return new Response(JSON.stringify({ error: 'Handle is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Starting scrape for handle: ${handle}`);

    // Initialize Supabase client with better error handling
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call the Puppeteer API with the correct endpoint
    const scrapedData = await fetchPuppeteerProfile(handle);

    if (!scrapedData.success) {
      return new Response(JSON.stringify({ error: scrapedData.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Analyze content patterns
    const analysis = analyzeContent(scrapedData.tweets);

    // Prepare profile data for insertion
    const profileData = {
      user_id: user.id,
      handle: handle.replace('@', ''),
      display_name: scrapedData.profile.displayName,
      bio: scrapedData.profile.bio,
      verified: scrapedData.profile.verified,
      avatar_url: scrapedData.profile.avatarUrl,
      writing_style_json: analysis.writingStyle,
      common_phrases: analysis.commonPhrases,
      topic_areas: analysis.topicAreas,
      tweet_sample_count: scrapedData.tweets.length,
      average_tweet_length: analysis.averageTweetLength,
      thread_percentage: analysis.threadPercentage,
      emoji_usage: analysis.emojiUsage,
      last_scraped_at: new Date().toISOString(),
    };

    console.log('Profile data to insert:', JSON.stringify(profileData, null, 2));

    // Check if profile already exists and update, otherwise insert
    const { data: existingProfile, error: checkError } = await supabase
      .from('scraped_profiles')
      .select('id')
      .eq('user_id', user.id)
      .eq('handle', handle.replace('@', ''))
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing profile:', checkError);
      return new Response(JSON.stringify({ error: 'Database query error', details: checkError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let result;
    if (existingProfile) {
      console.log('Updating existing profile:', existingProfile.id);
      const { data, error } = await supabase
        .from('scraped_profiles')
        .update(profileData)
        .eq('id', existingProfile.id)
        .select()
        .single();
      result = { data, error };

      // Delete existing tweets for this profile
      await supabase
        .from('scraped_tweets')
        .delete()
        .eq('profile_id', existingProfile.id);
    } else {
      console.log('Inserting new profile');
      const { data, error } = await supabase
        .from('scraped_profiles')
        .insert(profileData)
        .select()
        .single();
      result = { data, error };
    }

    if (result.error) {
      console.error('Database operation error:', result.error);
      return new Response(JSON.stringify({ 
        error: 'Failed to save profile data', 
        details: result.error.message,
        code: result.error.code 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Store individual tweets
    const tweetsToInsert = scrapedData.tweets.map((tweet, index) => ({
      profile_id: result.data.id,
      content: tweet.text,
      is_thread: tweet.isThread,
      has_emojis: tweet.hasEmojis,
      hashtags: tweet.hashtags,
      tweet_length: tweet.length,
      position: index + 1,
      scraped_at: tweet.timestamp,
      engagement_likes: tweet.engagement?.likes || 0,
      engagement_retweets: tweet.engagement?.retweets || 0,
      engagement_replies: tweet.engagement?.replies || 0,
    }));

    const { error: tweetsError } = await supabase
      .from('scraped_tweets')
      .insert(tweetsToInsert);

    if (tweetsError) {
      console.error('Error saving tweets:', tweetsError);
      // Don't fail the whole operation if tweets fail to save
    }

    console.log('Successfully saved profile:', result.data.id);

    return new Response(JSON.stringify({ 
      success: true, 
      profile: result.data,
      analysis: analysis,
      tweets: scrapedData.tweets 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in scrape-twitter-profile function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
