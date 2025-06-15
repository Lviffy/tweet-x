import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import TweetCard from "./TweetCard";
import ThreadGroup from "./ThreadGroup";

interface GeneratedTweet {
  id: string;
  content: string;
  type: 'single' | 'thread';
}

interface TweetResultsProps {
  tweets: GeneratedTweet[];
  onCopyToClipboard: (content: string) => void;
}

const TweetResults = ({ tweets, onCopyToClipboard }: TweetResultsProps) => {
  // Group tweets by type
  const singleTweets = tweets.filter(tweet => tweet.type === 'single');
  const threadTweets = tweets.filter(tweet => tweet.type === 'thread');

  // Group thread tweets into thread variations
  const groupThreadsIntoVariations = (threadTweets: GeneratedTweet[]) => {
    const variations: GeneratedTweet[][] = [];
    let currentThread: GeneratedTweet[] = [];
    
    threadTweets.forEach((tweet) => {
      // Check if this tweet is the start of a new thread (contains "1/" or starts a new sequence)
      if (tweet.content.includes('1/') || (currentThread.length > 0 && !tweet.content.match(/\d+\/\d+/))) {
        if (currentThread.length > 0) {
          variations.push([...currentThread]);
        }
        currentThread = [tweet];
      } else {
        currentThread.push(tweet);
      }
    });
    
    // Add the last thread if it exists
    if (currentThread.length > 0) {
      variations.push(currentThread);
    }
    
    return variations;
  };

  const threadVariations = groupThreadsIntoVariations(threadTweets);

  return (
    <div className="space-y-4 h-[90vh] flex flex-col">
      <h3 className="text-2xl font-semibold">Generated Tweets</h3>
      {/* Parent scrollable container */}
      <div className="relative flex-1 min-h-0">
        <div
          className="flex-1 min-h-0 h-full pr-4"
        >
          {tweets.length === 0 ? (
            <Card className="bg-background/80 backdrop-blur-sm border-white/10">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Your generated tweets will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-full">
              <div className="space-y-6">
                {/* Single Tweets Section */}
                {singleTweets.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-muted-foreground">Single Tweets</h4>
                    <div className="space-y-4">
                      {singleTweets.map((tweet, index) => (
                        <TweetCard
                          key={tweet.id}
                          tweet={tweet}
                          index={index}
                          onCopy={onCopyToClipboard}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Thread Tweets Section */}
                {threadVariations.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-muted-foreground">Thread Variations</h4>
                    <ThreadGroup 
                      threads={threadVariations} 
                      onCopy={onCopyToClipboard} 
                    />
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
};

export default TweetResults;
