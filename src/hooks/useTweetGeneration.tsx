
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
  includeHashtags: boolean;
  includeEmojis: boolean;
  includeCTA: boolean;
}

export const useTweetGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTweets, setGeneratedTweets] = useState<GeneratedTweet[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const generateTweets = async (params: TweetGenerationParams) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate tweets.",
        variant: "destructive"
      });
      return null;
    }

    const { handles, topic, tone, format, includeHashtags, includeEmojis, includeCTA } = params;

    if (!topic.trim() || !tone || handles.some(h => !h.trim())) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return null;
    }

    setIsGenerating(true);
    
    try {
      // For now, let's create mock data until the database types are updated
      const mockTweets: GeneratedTweet[] = [
        {
          id: "1",
          content: `🚀 Exciting developments in ${topic}! ${includeHashtags ? '#innovation #tech' : ''} ${includeEmojis ? '💡✨' : ''} ${includeCTA ? 'What are your thoughts? Let me know below!' : ''}`,
          type: format as 'single' | 'thread'
        }
      ];

      if (format === 'thread') {
        mockTweets.push({
          id: "2",
          content: `Here's why ${topic} matters: ${includeEmojis ? '👇' : ''}`,
          type: 'thread'
        });
        mockTweets.push({
          id: "3", 
          content: `The future of ${topic} looks bright! ${includeHashtags ? '#future #technology' : ''} ${includeCTA ? 'Follow for more insights!' : ''}`,
          type: 'thread'
        });
      }

      setGeneratedTweets(mockTweets);
      
      toast({
        title: "Tweets Generated!",
        description: "Your AI-generated tweets are ready."
      });

      return "mock-session-id";
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
    try {
      // Mock loading session for now
      console.log("Loading session:", sessionId);
      // For now, just set empty tweets
      setGeneratedTweets([]);
    } catch (error) {
      console.error('Error loading session:', error);
      toast({
        title: "Error",
        description: "Failed to load session.",
        variant: "destructive"
      });
    }
  };

  return {
    isGenerating,
    generatedTweets,
    generateTweets,
    loadSession,
    setGeneratedTweets
  };
};
