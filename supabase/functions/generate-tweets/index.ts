
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

    // Check if Gemini API key is available
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured')
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

Generate 3 different variations. Each variation should be a complete, standalone tweet or thread.

IMPORTANT: 
- Do NOT include variation labels like "Variation 1:", "Option 1:", etc.
- Do NOT include explanatory text or commentary
- Return ONLY the tweet content
- Separate each variation with a blank line
- For threads, separate each tweet with "---" and number them properly

Example format:
This is the first tweet variation about the topic.

This is the second tweet variation with a different approach.

This is the third tweet variation with another angle.`

    console.log('Calling Gemini API with prompt:', prompt)

    // Call Gemini API
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
    console.log('Gemini response:', JSON.stringify(geminiData, null, 2))

    if (!geminiData.candidates || !geminiData.candidates[0] || !geminiData.candidates[0].content) {
      console.error('Invalid Gemini response structure:', geminiData)
      throw new Error('Invalid response from Gemini AI')
    }

    const generatedContent = geminiData.candidates[0].content.parts[0].text

    // Clean and parse the generated content
    const cleanContent = generatedContent
      .replace(/\*\*Variation \d+:\*\*/g, '') // Remove variation labels
      .replace(/Variation \d+:/g, '') // Remove variation labels without asterisks
      .replace(/Option \d+:/g, '') // Remove option labels
      .replace(/^\d+\.\s*/gm, '') // Remove numbered list formatting
      .replace(/^-+$/gm, '') // Remove standalone dashes
      .trim()

    // Split by double newlines and filter out empty or very short content
    const variations = cleanContent
      .split(/\n\s*\n/)
      .map(v => v.trim())
      .filter(v => v.length > 5 && !v.match(/^-+$/) && !v.toLowerCase().includes('variation'))
      .slice(0, 3) // Ensure we only get 3 variations

    console.log('Cleaned variations:', variations)

    // If we don't have enough valid variations, create fallback content
    if (variations.length === 0) {
      throw new Error('No valid tweet content generated')
    }

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

    console.log('Generated tweets:', tweets)

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
