
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Clock, Users, Heart } from "lucide-react";

interface ScrapedTweetsCardProps {
  profile: any;
  tweets: any[];
  loading: boolean;
  onTweetClick: (tweet: any) => void;
}

const ScrapedTweetsCard = ({ profile, tweets, loading, onTweetClick }: ScrapedTweetsCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const formatTweetForDisplay = (tweet: any) => {
    const calculateEngagementRate = (tweet: any) => {
      const total = tweet.engagement_likes + tweet.engagement_retweets + tweet.engagement_replies;
      const estimatedFollowers = 1000; 
      return ((total / estimatedFollowers) * 100).toFixed(1);
    };

    return {
      id: tweet.id,
      text: tweet.content,
      timestamp: tweet.scraped_at,
      isThread: tweet.is_thread,
      hasEmojis: tweet.has_emojis,
      engagement: {
        replies: tweet.engagement_replies,
        retweets: tweet.engagement_retweets,
        likes: tweet.engagement_likes
      },
      analysis: {
        tweetType: tweet.is_thread ? 'thread' : 'single',
        sentiment: 'authentic',
        hooks: tweet.content.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0).slice(0, 2).map(s => s.substring(0, 20) + (s.length > 20 ? '...' : '')),
        callToAction: ['what do you think', 'let me know', 'share your', 'comment below', 'thoughts?'].some(cta => tweet.content.toLowerCase().includes(cta)) ? 'direct' : 'soft',
        timeOfDay: (() => {
          const hour = new Date(tweet.scraped_at).getHours();
          if (hour < 12) return 'morning';
          if (hour < 17) return 'afternoon';
          return 'evening';
        })(),
        wordCount: tweet.content.split(/\s+/).length,
        engagementRate: calculateEngagementRate(tweet)
      }
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Real Scraped Tweets</CardTitle>
        <p className="text-sm text-muted-foreground">
          Authentic tweets from @{profile.handle} (click to view detailed analysis)
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading tweets...</p>
          </div>
        ) : tweets.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">No tweets scraped yet for this profile</p>
          </div>
        ) : (
          tweets.map((tweet) => {
            const formattedTweet = formatTweetForDisplay(tweet);
            return (
              <div 
                key={tweet.id} 
                className="border rounded-lg p-4 space-y-3 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => onTweetClick(formattedTweet)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={profile.avatar_url || ''} />
                      <AvatarFallback className="text-xs">
                        {profile.handle.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-medium text-sm">@{profile.handle}</span>
                      <span className="text-muted-foreground text-xs ml-2">
                        {formatDate(tweet.scraped_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {tweet.is_thread ? 'thread' : 'single'}
                    </Badge>
                    {tweet.is_thread && (
                      <Badge variant="secondary" className="text-xs">
                        Thread
                      </Badge>
                    )}
                  </div>
                </div>
                
                <p className="text-sm leading-relaxed line-clamp-3">{tweet.content}</p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {formattedTweet.analysis.engagementRate}%
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formattedTweet.analysis.wordCount} words
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Real tweet
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-2">
                  <span>💬 {tweet.engagement_replies}</span>
                  <span>🔄 {tweet.engagement_retweets}</span>
                  <span>❤️ {tweet.engagement_likes}</span>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default ScrapedTweetsCard;
