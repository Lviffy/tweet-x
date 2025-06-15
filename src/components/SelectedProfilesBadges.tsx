
import React from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface SelectedProfilesBadgesProps {
  selectedProfiles: string[];
  maxProfiles: number;
  onRemoveProfile: (handle: string) => void;
}

const SelectedProfilesBadges = ({ selectedProfiles, maxProfiles, onRemoveProfile }: SelectedProfilesBadgesProps) => {
  if (selectedProfiles.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">
        Selected Profiles ({selectedProfiles.length}/{maxProfiles})
      </p>
      <div className="flex flex-wrap gap-2">
        {selectedProfiles.map((handle, index) => (
          <Badge 
            key={`${handle}-${index}`} // Use handle + index to ensure uniqueness
            variant="secondary" 
            className="flex items-center gap-1 px-2 py-1"
          >
            @{handle}
            <X 
              className="h-3 w-3 cursor-pointer hover:text-red-500" 
              onClick={() => onRemoveProfile(handle)}
            />
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default SelectedProfilesBadges;
