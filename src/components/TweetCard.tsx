
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { motion } from "framer-motion";

interface TweetCardProps {
  tweet: {
    id: string;
    content: string;
    type: 'single' | 'thread';
  };
  index: number;
  onCopy: (content: string) => void;
}

const TweetCard = ({ tweet, index, onCopy }: TweetCardProps) => {
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopy(tweet.content)}
            >
              <Copy className="w-4 h-4" />
            </Button>
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
