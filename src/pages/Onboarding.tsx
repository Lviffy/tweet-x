
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";

const Onboarding = () => {
  const { profile, loading, saveProfile } = useUserProfile();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Local state for form fields
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [industry, setIndustry] = useState("");
  const [goals, setGoals] = useState("");
  const [interests, setInterests] = useState("");

  // Pre-fill if profile exists
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setBio(profile.bio || "");
      setIndustry(profile.industry || "");
      setGoals(profile.goals || "");
      setInterests(profile.interests || "");
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast({ title: "Display Name is required", variant: "destructive" });
      return;
    }
    await saveProfile({
      display_name: displayName,
      bio,
      industry,
      goals,
      interests,
    });
    toast({ title: "Profile saved!", description: "Your onboarding details were saved." });
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-gray-900/20 px-4">
      <Card className="w-full max-w-lg shadow-xl bg-background/80 backdrop-blur border-white/10">
        <CardHeader>
          <CardTitle className="text-2xl">🙌 Onboarding</CardTitle>
          <div className="mt-1 text-muted-foreground text-sm">
            Tell us a bit about yourself to personalize your AI-generated tweets!
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="displayName" className="block ml-1 mb-1 font-medium">Display Name *</label>
              <Input
                id="displayName"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="bio" className="block ml-1 mb-1 font-medium">Short Bio</label>
              <Textarea
                id="bio"
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={2}
              />
            </div>
            <div>
              <label htmlFor="industry" className="block ml-1 mb-1 font-medium">Industry</label>
              <Input
                id="industry"
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                placeholder="e.g., SaaS, Education, Healthcare"
              />
            </div>
            <div>
              <label htmlFor="goals" className="block ml-1 mb-1 font-medium">What are your goals on Twitter?</label>
              <Textarea
                id="goals"
                value={goals}
                onChange={e => setGoals(e.target.value)}
                rows={2}
              />
            </div>
            <div>
              <label htmlFor="interests" className="block ml-1 mb-1 font-medium">Interests</label>
              <Input
                id="interests"
                value={interests}
                onChange={e => setInterests(e.target.value)}
                placeholder="e.g., AI, Startup, Marketing"
              />
            </div>
            <Button type="submit" className="w-full mt-2">
              Save & Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
