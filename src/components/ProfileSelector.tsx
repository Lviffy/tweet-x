
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Plus, RefreshCw, Trash2, User, Calendar, TrendingUp, Eye } from "lucide-react";
import { useScrapedProfiles } from "@/hooks/useScrapedProfiles";
import ProfileDetailView from "./ProfileDetailView";

interface ProfileSelectorProps {
  selectedProfiles: string[];
  onProfilesChange: (profiles: string[]) => void;
  maxProfiles?: number;
}

const ProfileSelector = ({ selectedProfiles, onProfilesChange, maxProfiles = 3 }: ProfileSelectorProps) => {
  const [newHandle, setNewHandle] = useState('');
  const { profiles, loading, scraping, scrapeProfile, deleteProfile, refreshProfile } = useScrapedProfiles();

  const handleAddProfile = async () => {
    if (!newHandle.trim()) return;
    
    const scrapedProfile = await scrapeProfile(newHandle);
    if (scrapedProfile) {
      setNewHandle('');
      // Auto-select the newly added profile if there's room
      if (selectedProfiles.length < maxProfiles) {
        const newSelection = [...selectedProfiles, scrapedProfile.handle];
        onProfilesChange(newSelection);
      }
    }
  };

  const handleProfileSelect = (handle: string) => {
    if (selectedProfiles.includes(handle)) {
      onProfilesChange(selectedProfiles.filter(h => h !== handle));
    } else if (selectedProfiles.length < maxProfiles) {
      onProfilesChange([...selectedProfiles, handle]);
    }
  };

  const handleRefresh = async (handle: string) => {
    await refreshProfile(handle);
  };

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

  return (
    <div className="space-y-4">
      <div>
        <Label>Select Writing Styles to Mimic (up to {maxProfiles})</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Choose from your analyzed profiles or add new ones
        </p>
      </div>

      {/* Add New Profile */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Input
              placeholder="@username (e.g., @naval, @levelsio)"
              value={newHandle}
              onChange={(e) => setNewHandle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddProfile()}
              disabled={scraping}
            />
            <Button 
              onClick={handleAddProfile} 
              disabled={scraping || !newHandle.trim()}
            >
              {scraping ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </Button>
          </div>
          {scraping && (
            <p className="text-sm text-muted-foreground mt-2">
              Analyzing writing style and content patterns...
            </p>
          )}
        </CardContent>
      </Card>

      {/* Profile Selection */}
      {loading ? (
        <div className="text-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading profiles...</p>
        </div>
      ) : profiles.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              No profiles analyzed yet. Add a Twitter handle above to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {profiles.map((profile) => {
            const analysis = getProfileAnalysisSummary(profile);
            const isSelected = selectedProfiles.includes(profile.handle);
            const canSelect = !isSelected && selectedProfiles.length < maxProfiles;
            
            return (
              <Card 
                key={profile.id} 
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
                      onClick={() => canSelect || isSelected ? handleProfileSelect(profile.handle) : null}
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
                        onClick={() => handleRefresh(profile.handle)}
                        disabled={scraping}
                        className="h-8 w-8 p-0"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteProfile(profile.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {selectedProfiles.length > 0 && (
        <div className="pt-2">
          <Label className="text-sm font-medium">
            Selected Profiles ({selectedProfiles.length}/{maxProfiles}):
          </Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedProfiles.map((handle) => (
              <Badge key={handle} variant="default" className="px-3 py-1">
                @{handle}
                <button
                  onClick={() => handleProfileSelect(handle)}
                  className="ml-2 text-xs hover:text-red-200"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSelector;
