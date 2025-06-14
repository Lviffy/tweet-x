
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ScrapedProfile {
  id: string;
  handle: string;
  display_name: string | null;
  bio: string | null;
  verified: boolean;
  avatar_url: string | null;
  writing_style_json: any;
  common_phrases: any;
  topic_areas: any;
  tweet_sample_count: number;
  average_tweet_length: number;
  thread_percentage: number;
  emoji_usage: number;
  last_scraped_at: string | null;
  created_at: string;
}

export const useScrapedProfiles = () => {
  const [profiles, setProfiles] = useState<ScrapedProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchProfiles = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Use type assertion to work with the table that exists but isn't in types yet
      const { data, error } = await (supabase as any)
        .from('scraped_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('last_scraped_at', { ascending: false });

      if (error) {
        console.error('Error fetching profiles:', error);
        toast({
          title: "Error",
          description: "Failed to fetch scraped profiles.",
          variant: "destructive"
        });
        return;
      }

      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrapeProfile = async (handle: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to scrape profiles.",
        variant: "destructive"
      });
      return null;
    }

    const cleanHandle = handle.replace('@', '');
    
    try {
      setScraping(true);
      
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        throw new Error('No active session');
      }

      const { data, error } = await supabase.functions.invoke('scrape-twitter-profile', {
        body: { handle: cleanHandle },
        headers: {
          Authorization: `Bearer ${authData.session.access_token}`,
        },
      });

      if (error) {
        console.error('Error scraping profile:', error);
        throw new Error('Failed to scrape profile');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to scrape profile');
      }

      await fetchProfiles(); // Refresh the list
      
      toast({
        title: "Profile Scraped!",
        description: `Successfully analyzed @${cleanHandle}'s writing style.`
      });

      return data.profile;
    } catch (error) {
      console.error('Profile scraping error:', error);
      toast({
        title: "Scraping Failed",
        description: "Could not scrape the profile. Please check the handle and try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setScraping(false);
    }
  };

  const deleteProfile = async (profileId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('scraped_profiles')
        .delete()
        .eq('id', profileId);

      if (error) {
        console.error('Error deleting profile:', error);
        throw error;
      }

      setProfiles(profiles.filter(p => p.id !== profileId));
      
      toast({
        title: "Profile Deleted",
        description: "The profile has been removed from your collection."
      });
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast({
        title: "Error",
        description: "Failed to delete profile.",
        variant: "destructive"
      });
    }
  };

  const refreshProfile = async (handle: string) => {
    return await scrapeProfile(handle);
  };

  useEffect(() => {
    if (user) {
      fetchProfiles();
    }
  }, [user]);

  return {
    profiles,
    loading,
    scraping,
    scrapeProfile,
    deleteProfile,
    refreshProfile,
    refetch: fetchProfiles
  };
};
