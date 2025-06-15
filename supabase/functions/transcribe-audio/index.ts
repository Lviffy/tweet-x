
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Transcribe audio function called');
    
    const { audio } = await req.json();
    
    if (!audio) {
      throw new Error('No audio data provided');
    }

    console.log('Processing audio data, length:', audio.length);

    // Convert base64 audio directly
    const audioBuffer = Uint8Array.from(atob(audio), c => c.charCodeAt(0));
    const base64Audio = btoa(String.fromCharCode(...audioBuffer));

    console.log('Sending to Google Speech-to-Text API');

    // Use the correct Google Cloud Speech-to-Text API endpoint
    const response = await fetch('https://speech.googleapis.com/v1/speech:recognize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('GEMINI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        config: {
          encoding: 'WEBM_OPUS',
          sampleRateHertz: 48000,
          languageCode: 'en-US',
          model: 'latest_short',
        },
        audio: {
          content: base64Audio,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Speech API error:', response.status, errorText);
      
      // If Google Speech fails, try a simple echo response for testing
      console.log('Falling back to test response');
      return new Response(
        JSON.stringify({ text: 'Speech transcription temporarily unavailable' }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    const result = await response.json();
    console.log('Transcription result:', result);

    // Extract text from Google Speech API response
    let transcribedText = '';
    if (result.results && result.results.length > 0) {
      transcribedText = result.results[0].alternatives[0].transcript;
    } else {
      transcribedText = 'No speech detected';
    }

    return new Response(
      JSON.stringify({ text: transcribedText }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Transcription error:', error);
    return new Response(
      JSON.stringify({ 
        text: 'Error during transcription: ' + error.message,
        error: error.message 
      }),
      {
        status: 200, // Return 200 so the frontend gets some response
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );
  }
});
