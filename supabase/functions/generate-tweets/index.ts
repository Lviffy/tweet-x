
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
    const { handles, topic, tone, format, includeHashtags, includeEmojis, includeCTA } = await req.json()
    
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

    // Build the prompt based on parameters
    let stylePrompt = ""
    if (handles && handles.length > 0) {
      stylePrompt = `Write in the style of ${handles.join(', ')}.`
    }

    let formatPrompt = ""
    if (format === 'single') {
      formatPrompt = "Create a single tweet (max 280 characters)."
    } else if (format.startsWith('thread')) {
      const threadLength = format.split('-')[1]
      formatPrompt = `Create a ${threadLength}-tweet thread. Number each tweet (1/, 2/, etc.).`
    }

    let optionsPrompt = ""
    const options = []
    if (includeHashtags) options.push("include relevant hashtags")
    if (includeEmojis) options.push("include appropriate emojis")
    if (includeCTA) options.push("include a call-to-action")
    if (options.length > 0) {
      optionsPrompt = `Make sure to ${options.join(', ')}.`
    }

    const toneMap = {
      'build-in-public': 'Build-in-public tone - authentic, transparent, sharing the journey',
      'fundraising': 'Professional fundraising tone - confident, data-driven, investor-focused',
      'inspirational': 'Inspirational and motivational tone',
      'technical': 'Technical deep-dive tone - detailed, educational, expert-level',
      'funny': 'Humorous and meme-like tone - entertaining, relatable, witty'
    }

    const prompt = `You are an expert social media content creator specializing in Twitter/X content. Create engaging, authentic tweets that match the requested style and format.

${stylePrompt} ${formatPrompt} ${optionsPrompt}

Topic: ${topic}
Tone: ${toneMap[tone] || tone}

Generate 3 different variations. For threads, separate each tweet with "---" and number them properly.

Return only the tweet content, no additional commentary.`

    // Call Gemini API
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${Deno.env.get('GEMINI_API_KEY')}`, {
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
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1500,
        }
      }),
    })

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text()
      console.error('Gemini API error:', errorData)
      throw new Error('Failed to generate tweets with Gemini AI')
    }

    const geminiData = await geminiResponse.json()
    const generatedContent = geminiData.candidates[0].content.parts[0].text

    // Parse the generated content into individual tweets
    const variations = generatedContent.split('\n\n').filter(v => v.trim())
    
    const tweets = variations.map((variation, index) => {
      if (format.startsWith('thread')) {
        return {
          id: crypto.randomUUID(),
          content: variation,
          type: 'thread' as const
        }
      } else {
        return {
          id: crypto.randomUUID(),
          content: variation,
          type: 'single' as const
        }
      }
    })

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
