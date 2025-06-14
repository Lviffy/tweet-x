
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ThreadTweet {
  id: string;
  content: string;
  type: 'single' | 'thread';
}

interface ThreadGroupProps {
  threads: ThreadTweet[][];
  onCopy: (content: string) => void;
}

const ThreadGroup = ({ threads, onCopy }: ThreadGroupProps) => {
  const [openThreads, setOpenThreads] = useState<{ [key: number]: boolean }>({});

  const toggleThread = (index: number) => {
    setOpenThreads(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const formatThreadContent = (threadTweets: ThreadTweet[]) => {
    return threadTweets.map(tweet => tweet.content).join('\n\n');
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCopy(formatThreadContent(threadVariation))}
                  >
                    <Copy className="w-4 h-4" />
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
              
              {/* Show first tweet preview when collapsed */}
              {!openThreads[index] && (
                <p className="whitespace-pre-wrap leading-relaxed text-sm text-muted-foreground">
                  {threadVariation[0]?.content.substring(0, 100)}
                  {threadVariation[0]?.content.length > 100 ? '...' : ''}
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
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onCopy(tweet.content)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
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
