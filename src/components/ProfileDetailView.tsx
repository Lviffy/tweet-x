
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { X, Calendar, TrendingUp, MessageCircle, Hash, Smile } from "lucide-react";

interface ProfileDetailViewProps {
  profile: any;
  children: React.ReactNode;
}

const ProfileDetailView = ({ profile, children }: ProfileDetailViewProps) => {
  // Generate sample tweets based on profile data
  const generateSampleTweets = () => {
    const templates = [
      `Building something new today. ${profile.common_phrases?.[0] || 'Excited to share'} the journey with everyone! 🚀`,
      `Quick thread on ${profile.topic_areas?.[0] || 'productivity'}: 1/ Start with the basics and build from there...`,
      `Just shipped a new feature! The ${profile.common_phrases?.[1] || 'user feedback'} has been amazing so far.`,
      `${profile.common_phrases?.[2] || 'Remember'}: progress over perfection. Ship early, iterate fast! 💪`,
      `Working on ${profile.topic_areas?.[1] || 'the next big thing'}. Here's what I've learned so far...`
    ];

    return templates.slice(0, profile.tweet_sample_count || 3).map((tweet, index) => ({
      id: index + 1,
      text: tweet,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      isThread: Math.random() > 0.7,
      hasEmojis: /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(tweet)
    }));
  };

  const sampleTweets = generateSampleTweets();

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

          {/* Writing Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Writing Analysis</CardTitle>
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
                <CardTitle className="text-lg">Common Phrases</CardTitle>
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

          {/* Sample Tweets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Tweets Sample</CardTitle>
              <p className="text-sm text-muted-foreground">
                Based on analyzed writing patterns
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {sampleTweets.map((tweet) => (
                <div key={tweet.id} className="border rounded-lg p-4 space-y-2">
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
                    {tweet.isThread && (
                      <Badge variant="outline" className="text-xs">
                        Thread
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed">{tweet.text}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>💬 {Math.floor(Math.random() * 50)}</span>
                    <span>🔄 {Math.floor(Math.random() * 20)}</span>
                    <span>❤️ {Math.floor(Math.random() * 100)}</span>
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
  );
};

export default ProfileDetailView;
