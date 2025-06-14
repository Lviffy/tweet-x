
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SignaturePhrasesCardProps {
  profile: any;
}

const SignaturePhrasesCard = ({ profile }: SignaturePhrasesCardProps) => {
  if (!profile.common_phrases || profile.common_phrases.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Signature Phrases & Hooks</CardTitle>
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
  );
};

export default SignaturePhrasesCard;
