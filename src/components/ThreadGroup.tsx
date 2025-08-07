
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Copy, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";

interface ThreadTweet {
  id: string;
  content: string;
  type: "single" | "thread";
  starred?: boolean;
}

interface ThreadGroupProps {
  threads: ThreadTweet[][];
  onCopy: (content: string) => void;
}

const ThreadGroup = ({ threads, onCopy }: ThreadGroupProps) => {
  const [openThreads, setOpenThreads] = useState<{ [key: number]: boolean }>({});
  const [starredMap, setStarredMap] = useState<{ [tweetId: string]: boolean }>({});

  const toggleThread = (index: number) => {
    setOpenThreads((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const formatThreadContent = (threadTweets: ThreadTweet[]) => {
    return threadTweets.map((tweet) => tweet.content).join("\n\n");
  };

  // Star/unstar ALL in thread variation
  const handleStarThread = async (threadTweets: ThreadTweet[]) => {
    // Determine if we're starring or unstarring
    const isAnyUnstarred = threadTweets.some((t) => !(starredMap[t.id] ?? t.starred));
    const newStarState = isAnyUnstarred; // true if ANY are unstarred
    const ids = threadTweets.map((t) => t.id);
    
    console.log('Updating thread starred status:', { tweetIds: ids, starred: newStarState });
    
    // Optimistic update
    setStarredMap((prev) => {
      const m = { ...prev };
      ids.forEach((id) => (m[id] = newStarState));
      return m;
    });
    try {
      // Update all at once
      const { data, error } = await supabase
        .from("generated_tweets")
        .update({ starred: newStarState })
        .in("id", ids)
        .select();
      
      if (error) {
        console.error('Error updating thread starred status:', error);
        throw error;
      }
      
      console.log('Successfully updated thread starred status:', data);
    } catch (e) {
      console.error('Failed to update thread starred status:', e);
      // Revert all if fail
      setStarredMap((prev) => {
        const m = { ...prev };
        ids.forEach((id) => (m[id] = !newStarState));
        return m;
      });
    }
  };

  const singleTweetStarToggle = async (tweetId: string, currentVal: boolean) => {
    console.log('Updating single tweet starred status:', { tweetId, starred: !currentVal });
    setStarredMap((m) => ({ ...m, [tweetId]: !currentVal }));
    try {
      const { data, error } = await supabase
        .from("generated_tweets")
        .update({ starred: !currentVal })
        .eq("id", tweetId)
        .select();
      
      if (error) {
        console.error('Error updating single tweet starred status:', error);
        throw error;
      }
      
      console.log('Successfully updated single tweet starred status:', data);
    } catch (e) {
      console.error('Failed to update single tweet starred status:', e);
      setStarredMap((m) => ({ ...m, [tweetId]: currentVal })); // revert
    }
  };

  return (
    <div className="space-y-4">
      {threads.map((threadVariation, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="bg-background/80 backdrop-blur-sm border-white/10">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm text-muted-foreground">
                  Thread {index + 1} ({threadVariation.length} tweets)
                </span>
                <div className="flex gap-2">
                  {/* Copy entire thread */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCopy(formatThreadContent(threadVariation))}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  {/* Star/Unstar ALL in this thread */}
                  <Button
                    variant={
                      threadVariation.every(
                        (tweet) =>
                          (starredMap[tweet.id] ?? tweet.starred) === true
                      )
                        ? "default"
                        : "ghost"
                    }
                    size="sm"
                    onClick={() => handleStarThread(threadVariation)}
                    aria-label="Star/Unstar entire thread"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        threadVariation.every(
                          (tweet) =>
                            (starredMap[tweet.id] ?? tweet.starred) === true
                        )
                          ? "text-yellow-400 fill-yellow-400"
                          : ""
                      }`}
                      fill={
                        threadVariation.every(
                          (tweet) =>
                            (starredMap[tweet.id] ?? tweet.starred) === true
                        )
                          ? "#facc15"
                          : "none"
                      }
                    />
                  </Button>
                  <Collapsible
                    open={openThreads[index]}
                    onOpenChange={() => toggleThread(index)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                        {openThreads[index] ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </Collapsible>
                </div>
              </div>

              {/* Preview first tweet when collapsed */}
              {!openThreads[index] && (
                <p className="whitespace-pre-wrap leading-relaxed text-sm text-muted-foreground">
                  {threadVariation[0]?.content.substring(0, 100)}
                  {threadVariation[0]?.content.length > 100 ? "..." : ""}
                </p>
              )}

              <Collapsible
                open={openThreads[index]}
                onOpenChange={() => toggleThread(index)}
              >
                <CollapsibleContent>
                  <AnimatePresence>
                    {openThreads[index] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 mt-3"
                      >
                        {threadVariation.map((tweet, tweetIndex) => (
                          <div
                            key={tweet.id}
                            className="border-l-2 border-primary/20 pl-4"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs text-muted-foreground">
                                Tweet {tweetIndex + 1}
                              </span>
                              <div className="flex gap-1">
                                {/* Individual star for this tweet */}
                                <Button
                                  variant={
                                    (starredMap[tweet.id] ?? tweet.starred)
                                      ? "default"
                                      : "ghost"
                                  }
                                  size="sm"
                                  onClick={() =>
                                    singleTweetStarToggle(
                                      tweet.id,
                                      starredMap[tweet.id] ?? !!tweet.starred
                                    )
                                  }
                                  aria-label={
                                    starredMap[tweet.id] ?? tweet.starred
                                      ? "Unstar tweet"
                                      : "Star tweet"
                                  }
                                >
                                  <Star
                                    className={`w-3 h-3 ${
                                      (starredMap[tweet.id] ?? tweet.starred)
                                        ? "text-yellow-400 fill-yellow-400"
                                        : ""
                                    }`}
                                    fill={
                                      (starredMap[tweet.id] ?? tweet.starred)
                                        ? "#facc15"
                                        : "none"
                                    }
                                  />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onCopy(tweet.content)}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <p className="whitespace-pre-wrap leading-relaxed text-sm">
                              {tweet.content}
                            </p>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default ThreadGroup;
