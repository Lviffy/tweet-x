
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { RefreshCw, Trash2, Eye, Calendar, TrendingUp } from "lucide-react";
import ProfileDetailView from "./ProfileDetailView";

interface ProfileCardProps {
  profile: any;
  isSelected: boolean;
  canSelect: boolean;
  scraping: boolean;
  onProfileSelect: (handle: string) => void;
  onRefresh: (handle: string) => void;
  onDelete: (id: string) => void;
}

const ProfileCard = ({ 
  profile, 
  isSelected, 
  canSelect, 
  scraping, 
  onProfileSelect, 
  onRefresh, 
  onDelete 
}: ProfileCardProps) => {
  const getProfileAnalysisSummary = (profile: any) => {
    const topics = profile.topic_areas?.slice(0, 3) || [];
    const avgLength = profile.average_tweet_length || 0;
    const threadPct = profile.thread_percentage || 0;
    
    return {
      topics,
      summary: `${avgLength} chars avg, ${threadPct}% threads`
    };
  };

  const formatLastScraped = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const analysis = getProfileAnalysisSummary(profile);

  return (
    <Card 
      className={`transition-all ${
        isSelected 
          ? 'ring-2 ring-primary bg-primary/5' 
          : canSelect 
            ? 'hover:shadow-md' 
            : 'opacity-50'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div 
            className="flex items-start gap-3 flex-1 cursor-pointer"
            onClick={() => canSelect || isSelected ? onProfileSelect(profile.handle) : null}
          >
            <Avatar className="w-10 h-10">
              <AvatarImage src={profile.avatar_url || ''} />
              <AvatarFallback>
                {profile.handle.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium truncate">
                  @{profile.handle}
                </h4>
                {profile.verified && (
                  <Badge variant="secondary" className="text-xs">
                    Verified
                  </Badge>
                )}
                {isSelected && (
                  <Badge variant="default" className="text-xs">
                    Selected
                  </Badge>
                )}
              </div>
              
              {profile.display_name && (
                <p className="text-sm text-muted-foreground truncate mb-1">
                  {profile.display_name}
                </p>
              )}
              
              {profile.bio && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {profile.bio}
                </p>
              )}
              
              <div className="flex flex-wrap gap-1 mb-2">
                {analysis.topics.map((topic: string) => (
                  <Badge key={topic} variant="outline" className="text-xs">
                    {topic}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {analysis.summary}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatLastScraped(profile.last_scraped_at)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <ProfileDetailView profile={profile}>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Eye className="w-3 h-3" />
              </Button>
            </ProfileDetailView>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRefresh(profile.handle)}
              disabled={scraping}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(profile.id)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
