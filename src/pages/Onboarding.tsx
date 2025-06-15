
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const INDUSTRY_OPTIONS = [
  "SaaS",
  "Education",
  "Healthcare",
  "Marketing",
  "AI/ML",
  "E-commerce",
  "Finance",
  "Technology",
  "Other",
];

const GOALS_OPTIONS = [
  "Grow my personal brand",
  "Find customers",
  "Connect with experts",
  "Share what I'm learning",
  "Get hired",
  "Network with peers",
  "Other",
];

const INTERESTS_OPTIONS = [
  "AI",
  "Startups",
  "Marketing",
  "Tech news",
  "Personal development",
  "Productivity",
  "Finance",
  "Design",
  "Other",
];

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
              <label className="block ml-1 mb-1 font-medium">Industry</label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRY_OPTIONS.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block ml-1 mb-1 font-medium">Goals on Twitter</label>
              <RadioGroup value={goals} onValueChange={setGoals} className="gap-2">
                {GOALS_OPTIONS.map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={option} />
                    <label htmlFor={option} className="text-sm">{option}</label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div>
              <label className="block ml-1 mb-1 font-medium">Interests</label>
              <Select value={interests} onValueChange={setInterests}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your main interest" />
                </SelectTrigger>
                <SelectContent>
                  {INTERESTS_OPTIONS.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
