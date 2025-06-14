
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

    // Scrape Twitter profile and tweets
    const scrapedData = await scrapeTwitterProfile(handle);
    
    if (!scrapedData.success) {
      return new Response(JSON.stringify({ error: scrapedData.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Analyze content patterns
    const analysis = analyzeContent(scrapedData.tweets);

    // Store in database
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

    // Check if profile already exists and update, otherwise insert
    const { data: existingProfile } = await supabase
      .from('scraped_profiles')
      .select('id')
      .eq('user_id', user.id)
      .eq('handle', handle.replace('@', ''))
      .single();

    let result;
    if (existingProfile) {
      const { data, error } = await supabase
        .from('scraped_profiles')
        .update(profileData)
        .eq('id', existingProfile.id)
        .select()
        .single();
      result = { data, error };
    } else {
      const { data, error } = await supabase
        .from('scraped_profiles')
        .insert(profileData)
        .select()
        .single();
      result = { data, error };
    }

    if (result.error) {
      console.error('Database error:', result.error);
      return new Response(JSON.stringify({ error: 'Failed to save profile data' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      profile: result.data,
      analysis: analysis 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in scrape-twitter-profile function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function scrapeTwitterProfile(handle: string) {
  try {
    // For demo purposes, I'll create a simplified scraper
    // In production, you'd want to use a proper Twitter scraping service
    const cleanHandle = handle.replace('@', '');
    const twitterUrl = `https://twitter.com/${cleanHandle}`;
    
    console.log(`Fetching profile from: ${twitterUrl}`);
    
    // Basic fetch to get page content
    const response = await fetch(twitterUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      return { success: false, error: 'Failed to fetch Twitter profile' };
    }

    const html = await response.text();
    
    // Extract basic profile info (simplified parsing)
    const displayNameMatch = html.match(/<title>([^(]+)/);
    const bioMatch = html.match(/content="([^"]*)" property="og:description"/);
    
    // Mock tweet data for demo (in production, you'd extract real tweets)
    const mockTweets: TweetData[] = [
      {
        text: "Building in public is the best way to grow your startup. Share your journey, failures, and wins. People love authenticity! 🚀",
        length: 124,
        isThread: false,
        hasEmojis: true,
        hashtags: []
      },
      {
        text: "1/ Thread on why most startups fail:\n\nIt's not about the idea. It's about execution, timing, and product-market fit. Let me break it down...",
        length: 134,
        isThread: true,
        hasEmojis: false,
        hashtags: []
      },
      {
        text: "Just shipped our MVP! Here's what I learned in the process. First, start small. Second, listen to users. Third, iterate fast.",
        length: 119,
        isThread: false,
        hasEmojis: false,
        hashtags: ["#MVP", "#startup"]
      }
    ];

    return {
      success: true,
      profile: {
        displayName: displayNameMatch ? displayNameMatch[1].trim() : cleanHandle,
        bio: bioMatch ? bioMatch[1] : '',
        verified: html.includes('verified'),
        avatarUrl: ''
      },
      tweets: mockTweets
    };

  } catch (error) {
    console.error('Scraping error:', error);
    return { success: false, error: 'Failed to scrape profile' };
  }
}

function analyzeContent(tweets: TweetData[]): ProfileAnalysis {
  const texts = tweets.map(t => t.text);
  
  // Analyze writing style
  const sentences = texts.join(' ').split(/[.!?]+/).filter(s => s.trim().length > 0);
  const averageWordsPerSentence = sentences.reduce((acc, s) => acc + s.trim().split(/\s+/).length, 0) / sentences.length;
  
  // Find common starting phrases
  const startPhrases = tweets.map(t => {
    const words = t.text.trim().split(/\s+/);
    return words.slice(0, 3).join(' ');
  });
  const commonStartPhrases = findMostCommon(startPhrases, 3);
  
  // Find common ending phrases
  const endPhrases = tweets.map(t => {
    const words = t.text.trim().split(/\s+/);
    return words.slice(-3).join(' ');
  });
  const commonEndPhrases = findMostCommon(endPhrases, 3);
  
  // Extract common phrases (2-3 word combinations)
  const allWords = texts.join(' ').toLowerCase().split(/\s+/);
  const phrases: string[] = [];
  for (let i = 0; i < allWords.length - 1; i++) {
    phrases.push(`${allWords[i]} ${allWords[i + 1]}`);
  }
  const commonPhrases = findMostCommon(phrases, 10);
  
  // Basic topic analysis (simplified)
  const topicKeywords = ['startup', 'build', 'product', 'business', 'growth', 'tech', 'ai', 'coding', 'marketing', 'fundraising'];
  const topicAreas = topicKeywords.filter(keyword => 
    texts.some(text => text.toLowerCase().includes(keyword))
  );
  
  // Calculate metrics
  const averageTweetLength = tweets.reduce((acc, t) => acc + t.length, 0) / tweets.length;
  const threadCount = tweets.filter(t => t.isThread).length;
  const threadPercentage = (threadCount / tweets.length) * 100;
  const emojiCount = tweets.filter(t => t.hasEmojis).length;
  const emojiUsage = (emojiCount / tweets.length) * 100;
  
  return {
    writingStyle: {
      averageWordsPerSentence: Math.round(averageWordsPerSentence),
      commonStartPhrases,
      commonEndPhrases,
      sentencePatterns: ['declarative', 'conversational'],
      toneKeywords: ['authentic', 'direct', 'helpful']
    },
    commonPhrases,
    topicAreas,
    averageTweetLength: Math.round(averageTweetLength),
    threadPercentage: Math.round(threadPercentage),
    emojiUsage: Math.round(emojiUsage)
  };
}

function findMostCommon(items: string[], limit: number): string[] {
  const frequency: { [key: string]: number } = {};
  items.forEach(item => {
    if (item.trim().length > 0) {
      frequency[item] = (frequency[item] || 0) + 1;
    }
  });
  
  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([item]) => item);
}
