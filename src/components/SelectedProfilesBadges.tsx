
import React from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface SelectedProfilesBadgesProps {
  selectedProfiles: string[];
  maxProfiles: number;
  onRemoveProfile: (handle: string) => void;
}

const SelectedProfilesBadges = ({ 
  selectedProfiles, 
  maxProfiles, 
  onRemoveProfile 
}: SelectedProfilesBadgesProps) => {
  if (selectedProfiles.length === 0) return null;

  return (
    <div className="pt-2">
      <Label className="text-sm font-medium">
        Selected Profiles ({selectedProfiles.length}/{maxProfiles}):
      </Label>
      <div className="flex flex-wrap gap-2 mt-2">
        {selectedProfiles.map((handle) => (
          <Badge key={handle} variant="default" className="px-3 py-1">
            @{handle}
            <button
              onClick={() => onRemoveProfile(handle)}
              className="ml-2 text-xs hover:text-red-200"
            >
              ×
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default SelectedProfilesBadges;
