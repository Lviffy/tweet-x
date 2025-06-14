
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, User } from "lucide-react";
import ProfileCard from "./ProfileCard";

interface ProfileListProps {
  profiles: any[];
  loading: boolean;
  scraping: boolean;
  selectedProfiles: string[];
  maxProfiles: number;
  onProfileSelect: (handle: string) => void;
  onRefresh: (handle: string) => void;
  onDelete: (id: string) => void;
}

const ProfileList = ({
  profiles,
  loading,
  scraping,
  selectedProfiles,
  maxProfiles,
  onProfileSelect,
  onRefresh,
  onDelete
}: ProfileListProps) => {
  if (loading) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
        <p className="text-muted-foreground">Loading profiles...</p>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            No profiles analyzed yet. Add a Twitter handle above to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      {profiles.map((profile) => {
        const isSelected = selectedProfiles.includes(profile.handle);
        const canSelect = !isSelected && selectedProfiles.length < maxProfiles;
        
        return (
          <ProfileCard
            key={profile.id}
            profile={profile}
            isSelected={isSelected}
            canSelect={canSelect}
            scraping={scraping}
            onProfileSelect={onProfileSelect}
            onRefresh={onRefresh}
            onDelete={onDelete}
          />
        );
      })}
    </div>
  );
};

export default ProfileList;
