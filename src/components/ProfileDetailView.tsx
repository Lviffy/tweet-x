
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { X, Calendar, TrendingUp, MessageCircle, Hash, Smile, Clock, Users, Heart } from "lucide-react";
import { useScrapedTweets } from "@/hooks/useScrapedTweets";

interface ProfileDetailViewProps {
  profile: any;
  children: React.ReactNode;
}

const ProfileDetailView = ({ profile, children }: ProfileDetailViewProps) => {
  const [selectedTweet, setSelectedTweet] = useState<any>(null);
  const { tweets, loading } = useScrapedTweets(profile.id);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const writingStyle = profile.writing_style_json || {};

  const formatTweetForDisplay = (tweet: any) => {
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
        hooks: extractHooks(tweet.content),
        callToAction: hasCallToAction(tweet.content) ? 'direct' : 'soft',
        timeOfDay: getTimeOfDay(tweet.scraped_at),
        wordCount: tweet.content.split(/\s+/).length,
        engagementRate: calculateEngagementRate(tweet)
      }
    };
  };

  const extractHooks = (content: string) => {
    const sentences = content.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    return sentences.slice(0, 2).map(s => s.substring(0, 20) + (s.length > 20 ? '...' : ''));
  };

  const hasCallToAction = (content: string) => {
    const ctaWords = ['what do you think', 'let me know', 'share your', 'comment below', 'thoughts?'];
    return ctaWords.some(cta => content.toLowerCase().includes(cta));
  };

  const getTimeOfDay = (timestamp: string) => {
    const hour = new Date(timestamp).getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const calculateEngagementRate = (tweet: any) => {
    const total = tweet.engagement_likes + tweet.engagement_retweets + tweet.engagement_replies;
    // Simulate follower count for rate calculation
    const estimatedFollowers = 1000; 
    return ((total / estimatedFollowers) * 100).toFixed(1);
  };

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          {children}
        </SheetTrigger>
        <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={profile.avatar_url || ''} />
                <AvatarFallback>
                  {profile.handle.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span>@{profile.handle}</span>
                  {profile.verified && (
                    <Badge variant="secondary" className="text-xs">
                      Verified
                    </Badge>
                  )}
                </div>
                {profile.display_name && (
                  <p className="text-sm text-muted-foreground font-normal">
                    {profile.display_name}
                  </p>
                )}
              </div>
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Bio */}
            {profile.bio && (
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm">{profile.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Writing Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detailed Writing Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Avg Length:</span>
                    <span className="font-medium">{profile.average_tweet_length || 0} chars</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MessageCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Threads:</span>
                    <span className="font-medium">{profile.thread_percentage || 0}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Smile className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Emojis:</span>
                    <span className="font-medium">{profile.emoji_usage || 0}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Samples:</span>
                    <span className="font-medium">{profile.tweet_sample_count || 0}</span>
                  </div>
                </div>

                {profile.topic_areas && profile.topic_areas.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Topic Areas:</p>
                    <div className="flex flex-wrap gap-1">
                      {profile.topic_areas.slice(0, 10).map((topic: string) => (
                        <Badge key={topic} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {writingStyle.toneKeywords && writingStyle.toneKeywords.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Writing Tone:</p>
                    <div className="flex flex-wrap gap-1">
                      {writingStyle.toneKeywords.map((tone: string) => (
                        <Badge key={tone} variant="secondary" className="text-xs">
                          {tone}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Common Phrases */}
            {profile.common_phrases && profile.common_phrases.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Signature Phrases & Hooks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.common_phrases.slice(0, 12).map((phrase: string) => (
                      <Badge key={phrase} variant="outline" className="text-xs">
                        "{phrase}"
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Real Scraped Tweets */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Scraped Tweets Analysis</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Real tweets from @{profile.handle} (click to view detailed analysis)
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
                    <p className="text-sm text-muted-foreground">No tweets available</p>
                  </div>
                ) : (
                  tweets.map((tweet) => {
                    const formattedTweet = formatTweetForDisplay(tweet);
                    return (
                      <div 
                        key={tweet.id} 
                        className="border rounded-lg p-4 space-y-3 cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => setSelectedTweet(formattedTweet)}
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

            {/* Last Updated */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
              <Calendar className="w-3 h-3" />
              <span>
                Last analyzed: {profile.last_scraped_at 
                  ? new Date(profile.last_scraped_at).toLocaleDateString() 
                  : 'Never'}
              </span>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Enhanced Tweet Detail Dialog */}
      <Dialog open={!!selectedTweet} onOpenChange={() => setSelectedTweet(null)}>
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
              
              {/* Detailed Analysis Section */}
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
    </>
  );
};

export default ProfileDetailView;
