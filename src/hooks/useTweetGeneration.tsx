
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface GeneratedTweet {
  id: string;
  content: string;
  type: 'single' | 'thread';
}

interface TweetGenerationParams {
  handles: string[];
  topic: string;
  tone: string;
  format: string;
  tweetCount: number;
  length: string;
  includeHashtags: boolean;
  includeEmojis: boolean;
  includeCTA: boolean;
}

export const useTweetGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTweets, setGeneratedTweets] = useState<GeneratedTweet[]>([]);
  const [sessionParams, setSessionParams] = useState<TweetGenerationParams | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const retryOperation = async <T,>(operation: () => Promise<T>, maxRetries = 3): Promise<T> => {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt} of ${maxRetries}`);
        return await operation();
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);
        lastError = error;
        
        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    throw lastError;
  };

  const generateTweets = async (params: TweetGenerationParams, isRegeneration = false) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate tweets.",
        variant: "destructive"
      });
      return null;
    }

    const { handles, topic, tone, format, tweetCount, length, includeHashtags, includeEmojis, includeCTA } = params;

    if (!topic.trim() || !tone) {
      toast({
        title: "Missing Information",
        description: "Please fill in the topic and select a tone.",
        variant: "destructive"
      });
      return null;
    }

    setIsGenerating(true);
    
    try {
      let sessionData;
      
      if (isRegeneration && currentSessionId) {
        // For regeneration, use existing session and delete old tweets
        console.log('Regenerating tweets for existing session:', currentSessionId);
        
        // Delete existing tweets from the session
        await retryOperation(async () => {
          return await supabase
            .from('generated_tweets')
            .delete()
            .eq('session_id', currentSessionId);
        });
        
        // Update session with new parameters
        const { data: updatedSession, error: updateError } = await retryOperation(async () => {
          return await supabase
            .from('tweet_sessions')
            .update({
              handles: handles,
              topic: topic,
              tone: tone,
              format: format,
              tweet_count: tweetCount,
              length: length,
              include_hashtags: includeHashtags,
              include_emojis: includeEmojis,
              include_cta: includeCTA,
              updated_at: new Date().toISOString()
            })
            .eq('id', currentSessionId)
            .select()
            .single();
        });

        if (updateError) {
          console.error('Error updating session:', updateError);
          throw updateError;
        }
        
        sessionData = updatedSession;
      } else {
        // Create a new session for initial generation
        const { data: newSessionData, error: sessionError } = await retryOperation(async () => {
          return await supabase
            .from('tweet_sessions')
            .insert([{
              user_id: user.id,
              title: `${topic.substring(0, 30)} - ${new Date().toLocaleDateString()}`,
              handles: handles,
              topic: topic,
              tone: tone,
              format: format,
              tweet_count: tweetCount,
              length: length,
              include_hashtags: includeHashtags,
              include_emojis: includeEmojis,
              include_cta: includeCTA
            }])
            .select()
            .single();
        });

        if (sessionError) {
          console.error('Error creating session:', sessionError);
          throw sessionError;
        }
        
        sessionData = newSessionData;
        setCurrentSessionId(sessionData.id);
      }

      // Call the Gemini AI Edge Function with retry logic
      const { data: aiResponse, error: aiError } = await retryOperation(async () => {
        return await supabase.functions.invoke('generate-tweets', {
          body: {
            handles,
            topic,
            tone,
            format,
            tweetCount,
            length,
            includeHashtags,
            includeEmojis,
            includeCTA
          }
        });
      });

      if (aiError) {
        console.error('Error calling AI function:', aiError);
        throw new Error('Failed to generate tweets with AI');
      }

      if (!aiResponse || !aiResponse.tweets) {
        throw new Error('Invalid response from AI service');
      }

      // Save generated tweets to database with retry logic
      const tweetsToInsert = aiResponse.tweets.map((tweet: GeneratedTweet, index: number) => ({
        session_id: sessionData.id,
        content: tweet.content,
        type: tweet.type,
        position: index + 1
      }));

      const { data: tweetsData, error: tweetsError } = await retryOperation(async () => {
        return await supabase
          .from('generated_tweets')
          .insert(tweetsToInsert)
          .select();
      });

      if (tweetsError) {
        console.error('Error saving tweets:', tweetsError);
        throw tweetsError;
      }

      const newGeneratedTweets: GeneratedTweet[] = tweetsData.map(tweet => ({
        id: tweet.id,
        content: tweet.content,
        type: tweet.type as 'single' | 'thread'
      }));

      setGeneratedTweets(newGeneratedTweets);
      setSessionParams(params);
      
      const mimicMessage = handles.length > 0 ? ` mimicking @${handles.join(', @')}` : '';
      const actionMessage = isRegeneration ? 'Regenerated' : 'Generated';
      toast({
        title: `Tweets ${actionMessage}!`,
        description: `${newGeneratedTweets.length} AI-generated tweets are ready${mimicMessage}.`
      });

      return sessionData.id;
    } catch (error) {
      console.error('Tweet generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Please try again. Make sure you have a stable internet connection.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const loadSession = async (sessionId: string) => {
    if (isLoadingSession) {
      console.log('Session loading already in progress, skipping...');
      return null;
    }

    setIsLoadingSession(true);
    
    try {
      console.log(`Loading session: ${sessionId}`);
      
      // Load session data with form parameters using retry logic
      const { data: sessionData, error: sessionError } = await retryOperation(async () => {
        return await supabase
          .from('tweet_sessions')
          .select('*')
          .eq('id', sessionId)
          .maybeSingle(); // Use maybeSingle instead of single to handle empty results
      });

      if (sessionError) {
        console.error('Error loading session:', sessionError);
        throw sessionError;
      }

      if (!sessionData) {
        console.warn('Session not found');
        toast({
          title: "Session Not Found",
          description: "The requested session could not be found.",
          variant: "destructive"
        });
        return null;
      }

      // Set current session ID
      setCurrentSessionId(sessionData.id);

      // Load tweets for the session with retry logic
      const { data: tweetsData, error: tweetsError } = await retryOperation(async () => {
        return await supabase
          .from('generated_tweets')
          .select('*')
          .eq('session_id', sessionId)
          .order('position', { ascending: true });
      });

      if (tweetsError) {
        console.error('Error loading tweets:', tweetsError);
        throw tweetsError;
      }

      const tweets: GeneratedTweet[] = tweetsData?.map(tweet => ({
        id: tweet.id,
        content: tweet.content,
        type: tweet.type as 'single' | 'thread'
      })) || [];

      // Extract session parameters
      const sessionRecord = sessionData as any;
      const params: TweetGenerationParams = {
        handles: sessionRecord.handles || [],
        topic: sessionRecord.topic || '',
        tone: sessionRecord.tone || '',
        format: sessionRecord.format || 'single',
        tweetCount: sessionRecord.tweet_count || 3,
        length: sessionRecord.length || 'medium',
        includeHashtags: sessionRecord.include_hashtags || false,
        includeEmojis: sessionRecord.include_emojis || false,
        includeCTA: sessionRecord.include_cta || false
      };

      console.log('Session loaded successfully:', params);
      setGeneratedTweets(tweets);
      setSessionParams(params);
      
      return params;
    } catch (error) {
      console.error('Error loading session:', error);
      toast({
        title: "Error",
        description: "Failed to load session. Please try refreshing the page.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoadingSession(false);
    }
  };

  const clearSession = () => {
    console.log('Clearing session data');
    setGeneratedTweets([]);
    setSessionParams(null);
    setCurrentSessionId(null);
  };

  return {
    isGenerating,
    generatedTweets,
    sessionParams,
    isLoadingSession,
    generateTweets,
    loadSession,
    clearSession,
    setGeneratedTweets
  };
};
