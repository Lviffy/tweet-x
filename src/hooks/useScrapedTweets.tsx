
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ScrapedTweet {
  id: string;
  profile_id: string;
  content: string;
  is_thread: boolean;
  has_emojis: boolean;
  hashtags: string[];
  tweet_length: number;
  position: number;
  scraped_at: string;
  engagement_likes: number;
  engagement_retweets: number;
  engagement_replies: number;
  created_at: string;
}

export const useScrapedTweets = (profileId?: string) => {
  const [tweets, setTweets] = useState<ScrapedTweet[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchTweets = async (targetProfileId?: string) => {
    if (!user || !targetProfileId) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('scraped_tweets')
        .select('*')
        .eq('profile_id', targetProfileId)
        .order('position', { ascending: true });

      if (error) {
        console.error('Error fetching tweets:', error);
        toast({
          title: "Error",
          description: "Failed to fetch scraped tweets.",
          variant: "destructive"
        });
        return;
      }

      setTweets(data || []);
    } catch (error) {
      console.error('Error fetching tweets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profileId) {
      fetchTweets(profileId);
    }
  }, [profileId, user]);

  return {
    tweets,
    loading,
    refetch: () => fetchTweets(profileId)
  };
};
