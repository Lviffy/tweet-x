
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, MessageCircle, Smile, Hash } from "lucide-react";

interface WritingAnalysisCardProps {
  profile: any;
}

const WritingAnalysisCard = ({ profile }: WritingAnalysisCardProps) => {
  const writingStyle = profile.writing_style_json || {};

  return (
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
  );
};

export default WritingAnalysisCard;
