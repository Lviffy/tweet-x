
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { X, Calendar, TrendingUp, MessageCircle, Hash, Smile, Clock, Users, Heart } from "lucide-react";

interface ProfileDetailViewProps {
  profile: any;
  children: React.ReactNode;
}

const ProfileDetailView = ({ profile, children }: ProfileDetailViewProps) => {
  const [selectedTweet, setSelectedTweet] = useState<any>(null);

  // Generate enhanced sample tweets with more detailed analysis
  const generateDetailedSampleTweets = () => {
    const templates = [
      {
        content: `Building something new today. ${profile.common_phrases?.[0] || 'Excited to share'} the journey with everyone! 🚀`,
        engagement: { replies: 23, retweets: 45, likes: 156 },
        tweetType: 'announcement',
        sentiment: 'positive',
        hooks: ['Building something new', 'journey'],
        callToAction: 'implicit',
        timeOfDay: 'morning',
        wordCount: 15
      },
      {
        content: `Quick thread on ${profile.topic_areas?.[0] || 'productivity'}: 1/ Start with the basics and build from there. 2/ Focus on consistency over perfection. 3/ Ship early, iterate fast. That's it! 💪`,
        engagement: { replies: 67, retweets: 89, likes: 234 },
        tweetType: 'thread',
        sentiment: 'educational',
        hooks: ['Quick thread', 'Start with the basics'],
        callToAction: 'educational',
        timeOfDay: 'afternoon',
        wordCount: 28
      },
      {
        content: `Just shipped a new feature! The ${profile.common_phrases?.[1] || 'user feedback'} has been amazing so far. Here's what we learned...`,
        engagement: { replies: 34, retweets: 28, likes: 123 },
        tweetType: 'update',
        sentiment: 'celebratory',
        hooks: ['Just shipped', 'amazing feedback'],
        callToAction: 'soft',
        timeOfDay: 'evening',
        wordCount: 20
      },
      {
        content: `${profile.common_phrases?.[2] || 'Remember'}: progress over perfection. Every small step counts. Keep going! 🔥`,
        engagement: { replies: 12, retweets: 67, likes: 189 },
        tweetType: 'motivational',
        sentiment: 'inspirational',
        hooks: ['Remember', 'progress over perfection'],
        callToAction: 'motivational',
        timeOfDay: 'morning',
        wordCount: 12
      },
      {
        content: `Working on ${profile.topic_areas?.[1] || 'the next big thing'}. Here's what I've learned so far: 1. Listen to users 2. Iterate quickly 3. Stay focused. What would you add?`,
        engagement: { replies: 89, retweets: 34, likes: 167 },
        tweetType: 'question',
        sentiment: 'engaging',
        hooks: ['Working on', 'what I\'ve learned'],
        callToAction: 'direct question',
        timeOfDay: 'afternoon',
        wordCount: 25
      }
    ];

    return templates.slice(0, profile.tweet_sample_count || 3).map((template, index) => ({
      id: index + 1,
      text: template.content,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      isThread: template.tweetType === 'thread',
      hasEmojis: /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(template.content),
      engagement: template.engagement,
      analysis: {
        tweetType: template.tweetType,
        sentiment: template.sentiment,
        hooks: template.hooks,
        callToAction: template.callToAction,
        timeOfDay: template.timeOfDay,
        wordCount: template.wordCount,
        engagementRate: ((template.engagement.replies + template.engagement.retweets + template.engagement.likes) / 1000 * 100).toFixed(1)
      }
    }));
  };

  const sampleTweets = generateDetailedSampleTweets();

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

                {/* Enhanced Style Metrics */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Best Time:</span>
                    <span className="font-medium ml-2">Morning</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Avg Engagement:</span>
                    <span className="font-medium ml-2">3.4%</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Question Rate:</span>
                    <span className="font-medium ml-2">25%</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">CTA Usage:</span>
                    <span className="font-medium ml-2">40%</span>
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

            {/* Enhanced Sample Tweets with Detailed Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tweet Analysis & Examples</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Detailed breakdown of writing patterns (click to view analysis)
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {sampleTweets.map((tweet) => (
                  <div 
                    key={tweet.id} 
                    className="border rounded-lg p-4 space-y-3 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setSelectedTweet(tweet)}
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
                            {formatDate(tweet.timestamp)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {tweet.analysis.tweetType}
                        </Badge>
                        {tweet.isThread && (
                          <Badge variant="secondary" className="text-xs">
                            Thread
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm leading-relaxed line-clamp-3">{tweet.text}</p>
                    
                    {/* Quick Analysis Preview */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {tweet.analysis.engagementRate}%
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {tweet.analysis.wordCount} words
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {tweet.analysis.sentiment}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-2">
                      <span>💬 {tweet.engagement.replies}</span>
                      <span>🔄 {tweet.engagement.retweets}</span>
                      <span>❤️ {tweet.engagement.likes}</span>
                    </div>
                  </div>
                ))}
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
                    <span className="text-muted-foreground">Sentiment:</span>
                    <span className="font-medium ml-2 capitalize">{selectedTweet.analysis.sentiment}</span>
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
                  <span className="text-muted-foreground text-sm">Hook Phrases:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedTweet.analysis.hooks.map((hook: string) => (
                      <Badge key={hook} variant="outline" className="text-xs">
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
              
              {selectedTweet.isThread && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">
                    This is part of a thread. Thread tweets typically see {selectedTweet.analysis.engagementRate}% higher engagement than single tweets for this author.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileDetailView;
