
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Calendar } from "lucide-react";
import { useScrapedTweets } from "@/hooks/useScrapedTweets";
import ProfileHeader from "./ProfileHeader";
import WritingAnalysisCard from "./WritingAnalysisCard";
import SignaturePhrasesCard from "./SignaturePhrasesCard";
import ScrapedTweetsCard from "./ScrapedTweetsCard";
import TweetDetailDialog from "./TweetDetailDialog";

interface ProfileDetailViewProps {
  profile: any;
  children: React.ReactNode;
}

const ProfileDetailView = ({ profile, children }: ProfileDetailViewProps) => {
  const [selectedTweet, setSelectedTweet] = useState<any>(null);
  const { tweets, loading } = useScrapedTweets(profile.id);

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          {children}
        </SheetTrigger>
        <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
          <ProfileHeader profile={profile} />

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
            <WritingAnalysisCard profile={profile} />

            {/* Common Phrases */}
            <SignaturePhrasesCard profile={profile} />

            {/* Real Scraped Tweets */}
            <ScrapedTweetsCard 
              profile={profile}
              tweets={tweets}
              loading={loading}
              onTweetClick={setSelectedTweet}
            />

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
      <TweetDetailDialog 
        profile={profile}
        selectedTweet={selectedTweet}
        onClose={() => setSelectedTweet(null)}
      />
    </>
  );
};

export default ProfileDetailView;
