
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Star } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface TweetCardProps {
  tweet: {
    id: string;
    content: string;
    type: 'single' | 'thread';
    starred?: boolean;
  };
  index: number;
  onCopy: (content: string) => void;
  onStarToggle?: (tweetId: string, starred: boolean) => void;
}

const TweetCard = ({ tweet, index, onCopy, onStarToggle }: TweetCardProps) => {
  const [starred, setStarred] = useState(tweet.starred ?? false);
  const [saving, setSaving] = useState(false);

  // Handle optimistic Star/Unstar
  const handleStar = async () => {
    if (!tweet.id) return;
    setSaving(true);
    const newStarred = !starred;
    setStarred(newStarred);
    try {
      console.log('Updating tweet starred status:', { tweetId: tweet.id, starred: newStarred });
      // update local, then db
      const { data, error } = await supabase
        .from('generated_tweets')
        .update({ starred: newStarred })
        .eq('id', tweet.id)
        .select();
      
      if (error) {
        console.error('Error updating tweet starred status:', error);
        throw error;
      }
      
      console.log('Successfully updated tweet starred status:', data);
      if (onStarToggle) onStarToggle(tweet.id, newStarred);
    } catch (e) {
      console.error('Failed to update tweet starred status:', e);
      setStarred(!newStarred); // revert on fail
    }
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="bg-background/80 backdrop-blur-sm border-white/10">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start mb-3">
            <span className="text-sm text-muted-foreground">
              Variation {index + 1}
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCopy(tweet.content)}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant={starred ? "default" : "ghost"}
                size="sm"
                onClick={handleStar}
                aria-label={starred ? "Unstar tweet" : "Star tweet"}
                disabled={saving}
              >
                <Star className={`w-4 h-4 ${starred ? "text-yellow-400 fill-yellow-400" : ""}`} fill={starred ? "#facc15" : "none"} />
              </Button>
            </div>
          </div>
          <p className="whitespace-pre-wrap leading-relaxed">
            {tweet.content}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TweetCard;
