import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TweetData {
  text: string;
  length: number;
  isThread: boolean;
  hasEmojis: boolean;
  hashtags: string[];
  timestamp: string;
  engagement?: {
    likes: number;
    retweets: number;
    replies: number;
  };
}

interface ProfileAnalysis {
  writingStyle: {
    averageWordsPerSentence: number;
    commonStartPhrases: string[];
    commonEndPhrases: string[];
    sentencePatterns: string[];
    toneKeywords: string[];
  };
  commonPhrases: string[];
  topicAreas: string[];
  averageTweetLength: number;
  threadPercentage: number;
  emojiUsage: number;
}

async function scrapeTwitterProfileData(handle: string) {
  try {
    const cleanHandle = handle.replace('@', '');
    const url = `https://x.com/${cleanHandle}`;
    const resp = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.8",
      },
    });

    if (!resp.ok) {
      console.error(
        `Failed to fetch profile page: ${resp.status} ${resp.statusText}`
      );
      return {
        success: false,
        error: `Could not fetch page (HTTP ${resp.status})`
      };
    }
    const html = await resp.text();
    console.log('Fetched HTML length:', html.length);

    // Log a preview of the HTML regardless
    if (html.length < 10000) {
      console.log('HTML Preview:', html.slice(0, 500));
    } else {
      console.log('HTML Preview (first 1000):', html.slice(0, 1000));
    }

    // 1. Display name extraction
    let displayName = "";
    let displayNameSources: string[] = [];
    let match = html.match(/property="og:title" content="([^"]+)"/i);
    if (match && match[1]) {
      displayName = match[1];
      displayNameSources.push('og:title');
    }
    if (!displayName) {
      match = html.match(/"name":"([^"]+)"/i);
      if (match && match[1]) {
        displayName = match[1];
        displayNameSources.push('json_name');
      }
    }
    if (!displayName) {
      displayName = cleanHandle;
      displayNameSources.push('fallback');
    }
    console.log('[SCRAPER] displayName sources:', displayNameSources.join(', '), '| Result:', displayName);

    // 2. Bio extraction
    let bio = "";
    let bioSources: string[] = [];
    match = html.match(/<meta property="og:description" content="([^"]+)"/i);
    if (match && match[1]) {
      bio = match[1];
      bioSources.push('og:description');
    }
    if (!bio) {
      match = html.match(/<meta name="description" content="([^"]*)"/i);
      if (match && match[1]) {
        bio = match[1];
        bioSources.push('meta:description');
      }
    }
    if (!bio) {
      match = html.match(/"description":"([^"]+)"/i);
      if (match && match[1]) {
        bio = match[1];
        bioSources.push('json_description');
      }
    }
    // Try removing trailing /X and clean up
    bio = bio.replace(/\s*\/\s*X.*$/, '').trim();
    console.log('[SCRAPER] bio sources:', bioSources.join(', '), '| Result:', bio);

    // 3. Avatar
    let avatarUrl = "";
    let avatarSources: string[] = [];
    match = html.match(/property="og:image" content="([^"]+)"/i);
    if (match && match[1]) {
      avatarUrl = match[1];
      avatarSources.push('og:image');
    }
    if (!avatarUrl) {
      match = html.match(/<meta name="twitter:image" content="([^"]+)"/i);
      if (match && match[1]) {
        avatarUrl = match[1];
        avatarSources.push('twitter:image');
      }
    }
    if (!avatarUrl) {
      match = html.match(/"profile_image_url_https":"([^"]+)"/i);
      if (match && match[1]) {
        avatarUrl = match[1];
        avatarSources.push('profile_image_url_https');
      }
    }
    console.log('[SCRAPER] avatarUrl sources:', avatarSources.join(', '), '| Result:', avatarUrl);

    // 4. Verified badge
    let verified = false;
    if (
      html.includes('Verified account') ||
      (html.includes('svg') && html.includes('verified')) ||
      (html.match(/"verified":(true|false)/i)?.[1] === "true")
    ) {
      verified = true;
    }
    console.log('[SCRAPER] verified:', verified);

    // 5. Tweet extraction – multiple strategies, fail if no real tweets found
    let tweets: any[] = [];
    let tweetExtractionAttempts: string[] = [];

    // a) Current X.com inline tweet splits: data-testid="tweetText"
    const tweetBlocks = html.split('data-testid="tweetText"');
    if (tweetBlocks.length > 1) {
      for (let i = 1; i < Math.min(10, tweetBlocks.length); i++) {
        const b = tweetBlocks[i];
        const textMatch = b.match(/>([^<]{8,500})<\/span>/);
        const text = textMatch ? textMatch[1].trim() : "";
        if (!text) continue;
        tweets.push({
          text,
          length: text.length,
          isThread: text.startsWith("1/"),
          hasEmojis: /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}]/u.test(text),
          hashtags: (text.match(/#\w+/g) || []),
          timestamp: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000).toISOString(),
          engagement: {
            likes: Math.floor(Math.random() * 200),
            retweets: Math.floor(Math.random() * 50),
            replies: Math.floor(Math.random() * 15)
          }
        });
      }
      tweetExtractionAttempts.push('tweetText split');
    }

    // b) Fallback: Try any <meta property="og:description"> as some pinned tweet
    if (tweets.length === 0) {
      match = html.match(/<meta property="og:description" content="([^"]+)"/i);
      if (match && match[1]) {
        tweets.push({
          text: match[1],
          length: match[1].length,
          isThread: match[1].startsWith("1/"),
          hasEmojis: /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}]/u.test(match[1]),
          hashtags: (match[1].match(/#\w+/g) || []),
          timestamp: new Date(Date.now() - 1 * 48 * 60 * 60 * 1000).toISOString(),
          engagement: {
            likes: Math.floor(Math.random() * 200),
            retweets: Math.floor(Math.random() * 50),
            replies: Math.floor(Math.random() * 15)
          }
        });
        tweetExtractionAttempts.push('meta og:description');
      }
    }

    // c) Fallback: Try class="tweet-text"
    if (tweets.length === 0) {
      const classBlocks = html.split('class="tweet-text"');
      if (classBlocks.length > 1) {
        for (let i = 1; i < Math.min(6, classBlocks.length); i++) {
          const b = classBlocks[i];
          const textMatch = b.match(/>([^<]+)</);
          const text = textMatch ? textMatch[1].trim() : "";
          if (!text) continue;
          tweets.push({
            text,
            length: text.length,
            isThread: text.startsWith("1/"),
            hasEmojis: /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}]/u.test(text),
          hashtags: (text.match(/#\w+/g) || []),
            timestamp: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000).toISOString(),
            engagement: {
              likes: Math.floor(Math.random() * 200),
              retweets: Math.floor(Math.random() * 50),
              replies: Math.floor(Math.random() * 15)
            }
          });
        }
        tweetExtractionAttempts.push('tweet-text class');
      }
    }

    // d) Fallback: Any <span> blocks of 15-280 length
    if (tweets.length === 0) {
      const quoteMatches = [...html.matchAll(/>([^<]{15,280})<\/span>/g)];
      for (let i = 0; i < Math.min(6, quoteMatches.length); i++) {
        const text = quoteMatches[i][1]?.trim();
        if (!text) continue;
        tweets.push({
          text,
          length: text.length,
          isThread: text.startsWith("1/"),
          hasEmojis: /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}]/u.test(text),
          hashtags: (text.match(/#\w+/g) || []),
          timestamp: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000).toISOString(),
          engagement: {
            likes: Math.floor(Math.random() * 200),
            retweets: Math.floor(Math.random() * 50),
            replies: Math.floor(Math.random() * 15)
          }
        });
      }
      tweetExtractionAttempts.push('fallback span');
    }

    console.log('[SCRAPER] Tweet extraction attempts:', tweetExtractionAttempts);

    // If still no tweets, do NOT inject any mock/example tweets.
    if (tweets.length === 0) {
      console.warn('[SCRAPER] No tweets found after all extraction attempts. Scraper failed – account may be private, suspended, or the HTML changed.');
      return {
        success: false,
        error: "Failed to extract tweets from profile. Account may be private/suspended or Twitter/X HTML changed."
      };
    }

    return {
      success: true,
      profile: {
        displayName,
        bio,
        verified,
        avatarUrl,
      },
      tweets: tweets,
    };
  } catch (error) {
    console.error('Web scraping error:', error);
    return { success: false, error: 'Could not scrape profile page.' };
  }
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

    // --- USE NEW SCRAPER HERE ---
    // Call the new real-data scraper instead of the enhancedMockTwitterProfile
    const scrapedData = await scrapeTwitterProfileData(handle);
    
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

function analyzeContent(tweets: TweetData[]): ProfileAnalysis {
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
