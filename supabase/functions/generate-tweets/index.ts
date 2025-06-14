
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
      formatPrompt = "Create a single tweet (max 280 characters) optimized for maximum engagement."
    } else if (format.startsWith('thread')) {
      const threadLength = format.split('-')[1]
      formatPrompt = `Create a ${threadLength}-tweet thread. Start with a compelling hook in the first tweet. Number each tweet (1/${threadLength}, 2/${threadLength}, etc.). Each tweet should build narrative tension and provide value.`
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
- Each tweet must have viral potential with high engagement probability
- Use psychological triggers that make people want to share
- Include specific, concrete details rather than generic statements
- Create content that sparks discussion and replies
- Use formatting that enhances readability (line breaks, emphasis)
- Ensure content is valuable, entertaining, or thought-provoking
- Avoid generic advice - be specific and actionable

Generate ${tweetCount} different high-quality variations. Each should use different viral strategies and engagement tactics.

CRITICAL FORMATTING RULES:
- Do NOT include any labels like "Variation 1:", "Tweet 1:", "Option A:", etc.
- Do NOT include explanatory text or commentary
- Return ONLY the tweet content
- Separate each variation with exactly one blank line
- For threads, separate tweets with "---" on its own line
- Make each variation distinctly different in approach and style

Example format for single tweets:
This is a viral tweet with strong hook and emotional trigger.

This is another viral tweet with different angle and curiosity gap.

This is a third viral tweet with contrarian take and social proof.`

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
          temperature: 0.9, // Higher creativity for viral content
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 3000, // More tokens for multiple variations
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
    console.log('Gemini response:', JSON.stringify(geminiData, null, 2))

    if (!geminiData.candidates || !geminiData.candidates[0] || !geminiData.candidates[0].content) {
      console.error('Invalid Gemini response structure:', geminiData)
      throw new Error('Invalid response from Gemini AI')
    }

    const generatedContent = geminiData.candidates[0].content.parts[0].text

    // Enhanced content cleaning and parsing
    const cleanContent = generatedContent
      .replace(/\*\*(Variation|Tweet|Option)\s*\d+:?\*\*/gi, '') // Remove bold variation labels
      .replace(/(Variation|Tweet|Option)\s*\d+:?/gi, '') // Remove variation labels
      .replace(/^\d+[\.\)]\s*/gm, '') // Remove numbered list formatting
      .replace(/^[\-\*\+]\s*/gm, '') // Remove bullet points
      .replace(/^-{3,}$/gm, '---') // Normalize thread separators
      .replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines
      .trim()

    console.log('Cleaned content:', cleanContent)

    // Split by double newlines and filter out empty or invalid content
    const variations = cleanContent
      .split(/\n\s*\n/)
      .map(v => v.trim())
      .filter(v => {
        // Filter out short, invalid, or label-containing content
        return v.length > 10 && 
               !v.match(/^-+$/) && 
               !v.toLowerCase().includes('variation') &&
               !v.toLowerCase().includes('tweet:') &&
               !v.toLowerCase().includes('example') &&
               !v.toLowerCase().includes('here are') &&
               !v.match(/^\d+[\.\)]/)
      })
      .slice(0, tweetCount) // Ensure we only get the requested number

    console.log(`Final variations (${variations.length}):`, variations)

    // Enhanced fallback content if parsing fails
    if (variations.length === 0) {
      console.error('No valid variations found, using fallback content')
      const fallbackTemplates = [
        `🚀 Just shipped a new feature that took 6 months to build.\n\nTurns out users needed something completely different.\n\nBuilding in public teaches you humility real quick.`,
        `The biggest mistake I made as a founder:\n\nListening to everyone's advice.\n\nSometimes you need to trust your gut and ignore the noise.`,
        `Plot twist: The feature everyone said was "too simple" is now our most used.\n\nComplexity is the enemy of adoption.\n\nKeep it simple, keep it useful.`,
        `Harsh truth: Your product isn't failing because of features.\n\nIt's failing because you haven't found product-market fit.\n\nStop building, start listening.`,
        `Raised $1M, burned it in 8 months.\n\nLesson learned: Revenue > Funding.\n\nBootstrap mindset even when you have money.`,
        `3 years of "overnight success":\n\n• 47 failed prototypes\n• 12 pivots\n• 1 breakthrough\n\nSuccess is just failure with persistence.`,
        `Your competition isn't other startups.\n\nIt's the status quo.\n\nMost people prefer broken familiar over perfect unknown.`,
        `Technical debt is like credit card debt.\n\nFeels great at first.\n\nThen it compounds and kills you.`
      ];
      
      const tweets = fallbackTemplates.slice(0, tweetCount).map((content, index) => ({
        id: crypto.randomUUID(),
        content: content,
        type: format.startsWith('thread') ? 'thread' as const : 'single' as const
      }))

      return new Response(
        JSON.stringify({ tweets }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    const tweets = variations.map((variation, index) => {
      return {
        id: crypto.randomUUID(),
        content: variation,
        type: format.startsWith('thread') ? 'thread' as const : 'single' as const
      }
    })

    console.log(`Generated ${tweets.length} viral tweets:`, tweets)

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
