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

    // Enhanced mock scraping with more realistic content
    const scrapedData = await enhancedMockTwitterProfile(handle);
    
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

async function enhancedMockTwitterProfile(handle: string) {
  try {
    const cleanHandle = handle.replace('@', '');
    
    console.log(`Mocking enhanced profile data for: ${cleanHandle}`);
    
    // More comprehensive mock profiles with realistic tweet patterns
    const mockProfiles = {
      'naval': {
        displayName: 'Naval',
        bio: 'Angel investor. Creator of AngelList. Philosophy.',
        verified: true,
        avatarUrl: '',
        tweets: [
          {
            text: "Seek wealth, not money or status. Wealth is having assets that earn while you sleep. Money is how we transfer time and wealth. Status is your place in the social hierarchy.",
            length: 154,
            isThread: false,
            hasEmojis: false,
            hashtags: [],
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            engagement: { likes: 1245, retweets: 234, replies: 89 }
          },
          {
            text: "1/ Reading is faster than listening. Doing is faster than watching.\n\n2/ The best teachers are on the Internet. The best books are on the Internet. The best peers are on the Internet.\n\n3/ The tools for learning are abundant. It's the desire to learn that's scarce.",
            length: 268,
            isThread: true,
            hasEmojis: false,
            hashtags: [],
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            engagement: { likes: 2156, retweets: 445, replies: 156 }
          },
          {
            text: "The Internet has massively broadened the possible space of careers. Most people haven't figured this out yet.",
            length: 110,
            isThread: false,
            hasEmojis: false,
            hashtags: [],
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            engagement: { likes: 892, retweets: 178, replies: 67 }
          },
          {
            text: "Play long-term games with long-term people.",
            length: 44,
            isThread: false,
            hasEmojis: false,
            hashtags: [],
            timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            engagement: { likes: 3421, retweets: 789, replies: 234 }
          },
          {
            text: "Specific knowledge is knowledge that you cannot be trained for. If society can train you, it can train someone else, and replace you.",
            length: 137,
            isThread: false,
            hasEmojis: false,
            hashtags: [],
            timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
            engagement: { likes: 1678, retweets: 334, replies: 123 }
          }
        ]
      },
      'levelsio': {
        displayName: 'Pieter Levels',
        bio: 'Maker of Remote Year, Nomad List, Hoodmaps, etc. Building stuff, mostly remotely 🌴',
        verified: true,
        avatarUrl: '',
        tweets: [
          {
            text: "Building in public is the best marketing strategy for makers. Share your progress, failures, and wins. People love authenticity! 🚀",
            length: 130,
            isThread: false,
            hasEmojis: true,
            hashtags: [],
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            engagement: { likes: 456, retweets: 89, replies: 34 }
          },
          {
            text: "1/ Thread on why most startups fail:\n\nIt's not about the idea. It's about execution, timing, and product-market fit. Let me break it down...\n\n2/ Most founders fall in love with their solution, not the problem. They build what they want, not what users need.",
            length: 240,
            isThread: true,
            hasEmojis: false,
            hashtags: [],
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            engagement: { likes: 789, retweets: 156, replies: 67 }
          },
          {
            text: "Just shipped a new feature for @nomadlist. Here's what I learned: start small, get feedback fast, iterate quickly. Ship > perfect.",
            length: 135,
            isThread: false,
            hasEmojis: false,
            hashtags: [],
            timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            engagement: { likes: 234, retweets: 45, replies: 23 }
          },
          {
            text: "Remote work is not going away. Companies that don't adapt will lose the best talent to those that do. 🌍💻",
            length: 108,
            isThread: false,
            hasEmojis: true,
            hashtags: ['#remote', '#work'],
            timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            engagement: { likes: 567, retweets: 123, replies: 45 }
          },
          {
            text: "Making $100k/month from simple websites. No VC. No employees. Just code, coffee, and customers. ☕️💰",
            length: 102,
            isThread: false,
            hasEmojis: true,
            hashtags: ['#indiehacker'],
            timestamp: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
            engagement: { likes: 1234, retweets: 345, replies: 156 }
          }
        ]
      },
      'default': {
        displayName: cleanHandle,
        bio: `Building awesome things. Sharing the journey. Follow for insights on tech, startups, and life.`,
        verified: false,
        avatarUrl: '',
        tweets: [
          {
            text: "Building in public teaches you so much about your users. Every day I learn something new from the community feedback! 💪",
            length: 125,
            isThread: false,
            hasEmojis: true,
            hashtags: ["#buildinpublic"],
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            engagement: { likes: 45, retweets: 12, replies: 8 }
          },
          {
            text: "1/ Quick thread on productivity tips that actually work:\n\nTime blocking changed my life. Here's how I do it...\n\n2/ I divide my day into 2-hour focused blocks. Deep work in the morning, meetings in the afternoon.",
            length: 205,
            isThread: true,
            hasEmojis: false,
            hashtags: [],
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            engagement: { likes: 89, retweets: 23, replies: 15 }
          },
          {
            text: "Just launched my MVP! It's not perfect, but it's live. The feedback so far has been incredible. Here's what I learned:",
            length: 120,
            isThread: false,
            hasEmojis: false,
            hashtags: ["#MVP", "#startup"],
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            engagement: { likes: 67, retweets: 18, replies: 12 }
          },
          {
            text: "The best part about being a founder? You get to solve problems that matter to you. The worst part? Everything else 😅",
            length: 118,
            isThread: false,
            hasEmojis: true,
            hashtags: [],
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            engagement: { likes: 134, retweets: 28, replies: 19 }
          },
          {
            text: "Reminder: Your first version doesn't need to be perfect. It just needs to solve one problem really well. Ship it! 🚀",
            length: 115,
            isThread: false,
            hasEmojis: true,
            hashtags: [],
            timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
            engagement: { likes: 78, retweets: 16, replies: 9 }
          },
          {
            text: "Working late again, but love what I'm building. Coffee count: 4 ☕️. Energy level: Still going strong! 💪",
            length: 106,
            isThread: false,
            hasEmojis: true,
            hashtags: ["#hustle"],
            timestamp: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
            engagement: { likes: 56, retweets: 11, replies: 7 }
          }
        ]
      }
    };

    const profileKey = cleanHandle.toLowerCase();
    const profileData = mockProfiles[profileKey] || mockProfiles['default'];

    return {
      success: true,
      profile: profileData,
      tweets: profileData.tweets
    };

  } catch (error) {
    console.error('Enhanced mock scraping error:', error);
    return { success: false, error: 'Failed to generate profile data' };
  }
}

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
