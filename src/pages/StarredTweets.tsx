
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import TweetCard from "@/components/TweetCard";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface GeneratedTweet {
  id: string;
  content: string;
  type: "single" | "thread";
  starred?: boolean;
}

const StarredTweetsPage = () => {
  const [tweets, setTweets] = useState<GeneratedTweet[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStarredTweets = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("generated_tweets")
        .select("*")
        .eq("starred", true)
        .order("created_at", { ascending: false });
      if (error) {
        toast({
          title: "Error",
          description: "Failed to load starred tweets.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      // Map and coerce type to match "single" | "thread"
      const safeTweets: GeneratedTweet[] = (data ?? []).map((t: any) => ({
        ...t,
        type: t.type === "thread" ? "thread" : "single",
      }));
      setTweets(safeTweets);
      setLoading(false);
    };
    fetchStarredTweets();
  }, [toast]);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Tweet copied to clipboard.",
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center mb-6">
        <Button onClick={() => navigate(-1)} variant="ghost">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold ml-4">Starred Tweets</h1>
      </div>
      {loading ? (
        <div className="text-center py-20 text-muted-foreground">
          Loading...
        </div>
      ) : tweets.length === 0 ? (
        <Card className="bg-background/80 backdrop-blur-sm border-white/10 mb-10">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              You haven't starred any tweets yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {tweets.map((tweet, i) => (
            <TweetCard
              key={tweet.id}
              tweet={tweet}
              index={i}
              onCopy={handleCopy}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StarredTweetsPage;
