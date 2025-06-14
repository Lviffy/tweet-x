
import React from "react";
import { Label } from "@/components/ui/label";
import { useScrapedProfiles } from "@/hooks/useScrapedProfiles";
import AddProfileForm from "./AddProfileForm";
import ProfileList from "./ProfileList";
import SelectedProfilesBadges from "./SelectedProfilesBadges";

interface ProfileSelectorProps {
  selectedProfiles: string[];
  onProfilesChange: (profiles: string[]) => void;
  maxProfiles?: number;
}

const ProfileSelector = ({ selectedProfiles, onProfilesChange, maxProfiles = 3 }: ProfileSelectorProps) => {
  const { profiles, loading, scraping, scrapeProfile, deleteProfile, refreshProfile } = useScrapedProfiles();

  const handleAddProfile = async (handle: string) => {
    const scrapedProfile = await scrapeProfile(handle);
    if (scrapedProfile) {
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

  return (
    <div className="space-y-4">
      <div>
        <Label>Select Writing Styles to Mimic (Optional)</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Choose profiles to mimic their writing style, or leave empty to generate original content
        </p>
      </div>

      <AddProfileForm
        scraping={scraping}
        onAddProfile={handleAddProfile}
      />

      <ProfileList
        profiles={profiles}
        loading={loading}
        scraping={scraping}
        selectedProfiles={selectedProfiles}
        maxProfiles={maxProfiles}
        onProfileSelect={handleProfileSelect}
        onRefresh={handleRefresh}
        onDelete={deleteProfile}
      />

      {selectedProfiles.length > 0 && (
        <SelectedProfilesBadges
          selectedProfiles={selectedProfiles}
          maxProfiles={maxProfiles}
          onRemoveProfile={handleProfileSelect}
        />
      )}
    </div>
  );
};

export default ProfileSelector;
