
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { handles, topic, tone, format, tweetCount, includeHashtags, includeEmojis, includeCTA } = await req.json()
    
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get user from auth header
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Check if Gemini API key is available
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured')
    }

    // Build the prompt based on parameters
    let stylePrompt = ""
    if (handles && handles.length > 0) {
      stylePrompt = `Analyze and mimic the writing style, tone, and engagement patterns of ${handles.join(', ')}. Study their viral content patterns.`
    }

    let formatPrompt = ""
    if (format === 'single') {
      formatPrompt = "Create single tweets (max 280 characters each) optimized for maximum engagement."
    } else if (format.startsWith('thread')) {
      const threadLength = format.split('-')[1]
      formatPrompt = `Create ${threadLength}-tweet threads. Start each thread with a compelling hook in the first tweet. Number each tweet (1/${threadLength}, 2/${threadLength}, etc.). Each tweet should build narrative tension and provide value. Separate tweets in a thread with "---" on its own line.`
    }

    let optionsPrompt = ""
    const options = []
    if (includeHashtags) options.push("include 2-3 strategic hashtags that trend or have high engagement")
    if (includeEmojis) options.push("include 1-2 relevant emojis that enhance readability and emotion")
    if (includeCTA) options.push("include a compelling call-to-action that drives engagement")
    if (options.length > 0) {
      optionsPrompt = `Make sure to ${options.join(', ')}.`
    }

    const toneMap = {
      'build-in-public': 'Build-in-public tone - vulnerable, authentic, behind-the-scenes insights that people rarely share. Include specific numbers, failures, and lessons.',
      'fundraising': 'Professional fundraising tone - confident but not arrogant, data-driven with compelling narrative, investor-focused with clear value proposition.',
      'inspirational': 'Inspirational tone - motivational but not preachy, includes personal anecdotes, actionable advice, and relatable struggles.',
      'technical': 'Technical deep-dive tone - educational but accessible, includes code snippets or technical insights, appeals to developers and tech enthusiasts.',
      'funny': 'Humorous tone - witty observations, relatable tech humor, meme-worthy content, clever wordplay, timing-based comedy.'
    }

    const viralStrategies = `
VIRAL TWEET STRATEGIES:
1. Hook: Start with attention-grabbing opening (controversial take, shocking stat, bold prediction)
2. Emotion: Trigger strong emotions (surprise, anger, joy, fear, curiosity)
3. Relatability: Address common pain points or shared experiences
4. Storytelling: Use narrative structure with conflict and resolution
5. Specificity: Use concrete details, numbers, and examples
6. Controversy: Take a contrarian stance (but not offensive)
7. Value: Provide actionable insights or useful information
8. Urgency: Create time-sensitive or trending content
9. Social Proof: Reference success stories or popular opinions
10. Curiosity Gap: Tease information that makes people want to engage

ENGAGEMENT TACTICS:
- Ask thought-provoking questions
- Use line breaks for visual appeal and readability
- Include personal anecdotes or behind-the-scenes moments
- Reference current events or trending topics
- Use power words: "revealed", "secret", "mistake", "truth", "exposed"
- Create shareable quotes or one-liners
- Challenge conventional wisdom
- Share counter-intuitive insights
`

    const prompt = `You are a viral content specialist and social media expert. Create highly engaging, shareable tweets that maximize reach and engagement.

${stylePrompt} ${formatPrompt} ${optionsPrompt}

Topic: ${topic}
Tone: ${toneMap[tone] || tone}

${viralStrategies}

CONTENT REQUIREMENTS:
- Each tweet/thread must have viral potential with high engagement probability
- Use psychological triggers that make people want to share
- Include specific, concrete details rather than generic statements
- Create content that sparks discussion and replies
- Use formatting that enhances readability (line breaks, emphasis)
- Ensure content is valuable, entertaining, or thought-provoking
- Avoid generic advice - be specific and actionable

Generate exactly ${tweetCount} different high-quality variations. Each should use different viral strategies and engagement tactics.

CRITICAL FORMATTING RULES:
- Do NOT include any labels like "Variation 1:", "Tweet 1:", "Option A:", etc.
- Do NOT include explanatory text or commentary
- Return ONLY the tweet content
- For single tweets: Separate each variation with exactly three newlines (\n\n\n)
- For threads: Separate tweets within a thread with "---" on its own line, and separate thread variations with exactly three newlines (\n\n\n)
- Make each variation distinctly different in approach and style

Example format for single tweets:
First viral tweet with strong hook and emotional trigger.

Second viral tweet with different angle and curiosity gap.

Third viral tweet with contrarian take and social proof.

Example format for threads:
First thread hook tweet 1/3
---
Second tweet building tension 2/3
---
Third tweet with payoff 3/3


Second thread with different hook 1/3
---
Different approach middle tweet 2/3
---
Different conclusion 3/3`

    console.log(`Calling Gemini API to generate ${tweetCount} viral tweets`)

    // Call Gemini API with enhanced configuration
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4000,
          candidateCount: 1
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    })

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text()
      console.error('Gemini API error:', errorData)
      throw new Error('Failed to generate viral tweets with Gemini AI')
    }

    const geminiData = await geminiResponse.json()
    console.log('Gemini response received')

    if (!geminiData.candidates || !geminiData.candidates[0] || !geminiData.candidates[0].content) {
      console.error('Invalid Gemini response structure:', geminiData)
      throw new Error('Invalid response from Gemini AI')
    }

    const generatedContent = geminiData.candidates[0].content.parts[0].text
    console.log('Raw generated content:', generatedContent)

    // Enhanced content parsing for both single tweets and threads
    let tweets = []
    
    if (format === 'single') {
      // For single tweets, split by triple newlines
      const variations = generatedContent
        .split(/\n\s*\n\s*\n/)
        .map(v => v.trim())
        .filter(v => v.length > 10 && !v.toLowerCase().includes('variation') && !v.toLowerCase().includes('example'))
        .slice(0, tweetCount)
      
      tweets = variations.map((content, index) => ({
        id: crypto.randomUUID(),
        content: content,
        type: 'single' as const
      }))
    } else {
      // For threads, split by triple newlines to get thread variations
      const threadVariations = generatedContent
        .split(/\n\s*\n\s*\n/)
        .map(v => v.trim())
        .filter(v => v.length > 10)
        .slice(0, tweetCount)
      
      // Process each thread variation
      threadVariations.forEach((threadContent, threadIndex) => {
        const threadTweets = threadContent
          .split(/\n---\n|\n--\n/)
          .map(tweet => tweet.trim())
          .filter(tweet => tweet.length > 5)
        
        // Add each tweet in the thread
        threadTweets.forEach((tweetContent, tweetIndex) => {
          tweets.push({
            id: crypto.randomUUID(),
            content: tweetContent,
            type: 'thread' as const
          })
        })
      })
    }

    console.log(`Successfully parsed ${tweets.length} tweets from ${tweetCount} requested variations`)

    // Fallback if parsing fails
    if (tweets.length === 0) {
      console.log('Parsing failed, using fallback content')
      const fallbackTemplates = [
        `🚀 Just shipped a new feature that took 6 months to build.\n\nTurns out users needed something completely different.\n\nBuilding in public teaches you humility real quick.`,
        `The biggest mistake I made as a founder:\n\nListening to everyone's advice.\n\nSometimes you need to trust your gut and ignore the noise.`,
        `Plot twist: The feature everyone said was "too simple" is now our most used.\n\nComplexity is the enemy of adoption.\n\nKeep it simple, keep it useful.`,
        `Harsh truth: Your product isn't failing because of features.\n\nIt's failing because you haven't found product-market fit.\n\nStop building, start listening.`,
        `Raised $1M, burned it in 8 months.\n\nLesson learned: Revenue > Funding.\n\nBootstrap mindset even when you have money.`,
        `3 years of "overnight success":\n\n• 47 failed prototypes\n• 12 pivots\n• 1 breakthrough\n\nSuccess is just failure with persistence.`,
        `Your competition isn't other startups.\n\nIt's the status quo.\n\nMost people prefer broken familiar over perfect unknown.`,
        `Technical debt is like credit card debt.\n\nFeels great at first.\n\nThen it compounds and kills you.`
      ]
      
      tweets = fallbackTemplates.slice(0, tweetCount).map((content, index) => ({
        id: crypto.randomUUID(),
        content: content,
        type: format.startsWith('thread') ? 'thread' as const : 'single' as const
      }))
    }

    console.log(`Final result: Generated ${tweets.length} tweets`)

    return new Response(
      JSON.stringify({ tweets }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
