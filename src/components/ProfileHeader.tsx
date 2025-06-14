
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface ProfileHeaderProps {
  profile: any;
}

const ProfileHeader = ({ profile }: ProfileHeaderProps) => {
  return (
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
  );
};

export default ProfileHeader;
