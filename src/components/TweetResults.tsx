
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import TweetCard from "./TweetCard";

interface GeneratedTweet {
  id: string;
  content: string;
  type: 'single' | 'thread';
}

interface TweetResultsProps {
  tweets: GeneratedTweet[];
  isGenerating: boolean;
  onRegenerate: () => void;
  onCopyToClipboard: (content: string) => void;
}

const TweetResults = ({ tweets, isGenerating, onRegenerate, onCopyToClipboard }: TweetResultsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-semibold">Generated Tweets</h3>
      {tweets.length === 0 ? (
        <Card className="bg-background/80 backdrop-blur-sm border-white/10">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Your generated tweets will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tweets.map((tweet, index) => (
            <TweetCard
              key={tweet.id}
              tweet={tweet}
              index={index}
              onCopy={onCopyToClipboard}
            />
          ))}
          <Button
            variant="outline"
            onClick={onRegenerate}
            disabled={isGenerating}
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerate
          </Button>
        </div>
      )}
    </div>
  );
};

export default TweetResults;
