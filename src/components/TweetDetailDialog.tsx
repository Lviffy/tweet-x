
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface TweetDetailDialogProps {
  profile: any;
  selectedTweet: any;
  onClose: () => void;
}

const TweetDetailDialog = ({ profile, selectedTweet, onClose }: TweetDetailDialogProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  return (
    <Dialog open={!!selectedTweet} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={profile.avatar_url || ''} />
              <AvatarFallback>
                {profile.handle.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span>@{profile.handle}</span>
                {profile.verified && (
                  <Badge variant="secondary" className="text-xs">
                    Verified
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {selectedTweet?.analysis.tweetType}
                </Badge>
                {selectedTweet?.isThread && (
                  <Badge variant="secondary" className="text-xs">
                    Thread
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground font-normal">
                {selectedTweet && formatDate(selectedTweet.timestamp)} • {selectedTweet?.analysis.timeOfDay}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        {selectedTweet && (
          <div className="space-y-6">
            <div className="text-base leading-relaxed whitespace-pre-wrap">
              {selectedTweet.text}
            </div>
            
            <div className="bg-muted/30 rounded-lg p-4 space-y-4">
              <h4 className="font-medium text-sm">Tweet Analysis</h4>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium ml-2 capitalize">{selectedTweet.analysis.tweetType}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Word Count:</span>
                  <span className="font-medium ml-2">{selectedTweet.analysis.wordCount}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Call to Action:</span>
                  <span className="font-medium ml-2 capitalize">{selectedTweet.analysis.callToAction}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Engagement Rate:</span>
                  <span className="font-medium ml-2">{selectedTweet.analysis.engagementRate}%</span>
                </div>
              </div>
              
              <div>
                <span className="text-muted-foreground text-sm">Opening Hooks:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedTweet.analysis.hooks.map((hook: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      "{hook}"
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground border-t pt-4">
              <span className="flex items-center gap-2">
                💬 {selectedTweet.engagement.replies} replies
              </span>
              <span className="flex items-center gap-2">
                🔄 {selectedTweet.engagement.retweets} retweets
              </span>
              <span className="flex items-center gap-2">
                ❤️ {selectedTweet.engagement.likes} likes
              </span>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
              <p className="text-sm text-green-700 dark:text-green-300">
                ✅ This is a real tweet scraped from @{profile.handle}'s profile, providing authentic writing style analysis.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TweetDetailDialog;
