
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

const STEPS = [
  "displayName",
  "bio",
  "industry",
  "goals",
  "interests",
];

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

const STEP_TITLES: Record<string, string> = {
  displayName: "What's your display name?",
  bio: "Tell us about yourself",
  industry: "Which industry are you in?",
  goals: "What are your primary goals on Twitter?",
  interests: "Select your main interest",
};

const STEP_DESCRIPTIONS: Record<string, string> = {
  displayName: "This is how others will see you.",
  bio: "A short bio helps us personalize your tweets.",
  industry: "Choose the industry that best fits you.",
  goals: "Pick one that matches what you want most.",
  interests: "We’ll use this to craft relevant tweets.",
};

const Onboarding = () => {
  const { profile, loading, saveProfile } = useUserProfile();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);

  // Local state for form fields
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [industry, setIndustry] = useState("");
  const [goals, setGoals] = useState("");
  const [interests, setInterests] = useState("");
  const [error, setError] = useState<string | null>(null);

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

  const handleNext = () => {
    setError(null);
    // Validate current step
    switch (STEPS[step]) {
      case "displayName":
        if (!displayName.trim()) {
          setError("Display Name is required.");
          return;
        }
        break;
      case "industry":
        if (!industry) {
          setError("Please select your industry.");
          return;
        }
        break;
      case "goals":
        if (!goals) {
          setError("Please select a goal.");
          return;
        }
        break;
      case "interests":
        if (!interests) {
          setError("Please select an interest.");
          return;
        }
        break;
      default:
        break;
    }
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    if (step > 0) setStep(step - 1);
  };

  const handleFinish = async () => {
    setError(null);
    if (!displayName.trim()) {
      setError("Display Name is required.");
      setStep(0);
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

  const showBack = step > 0;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-gray-900/20 px-4">
      <Card className="w-full max-w-md shadow-xl bg-background/90 backdrop-blur border-white/10 transition-all duration-500 relative">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            🙌 Onboarding
            <span className="ml-auto text-xs text-muted-foreground">
              Step {step + 1} of {STEPS.length}
            </span>
          </CardTitle>
          <div className="mt-1 text-muted-foreground text-sm">
            {STEP_DESCRIPTIONS[STEPS[step]]}
          </div>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-5"
            onSubmit={e => {
              e.preventDefault();
              if (isLast) {
                handleFinish();
              } else {
                handleNext();
              }
            }}
          >
            {/* Render step specific content */}
            {STEPS[step] === "displayName" && (
              <div>
                <label htmlFor="displayName" className="block ml-1 mb-1 font-medium">
                  {STEP_TITLES.displayName} <span className="text-destructive">*</span>
                </label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  autoFocus
                  required
                  placeholder="e.g. Jane Doe"
                />
              </div>
            )}
            {STEPS[step] === "bio" && (
              <div>
                <label htmlFor="bio" className="block ml-1 mb-1 font-medium">{STEP_TITLES.bio}</label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={2}
                  placeholder="e.g. Product Builder, AI Enthusiast"
                />
              </div>
            )}
            {STEPS[step] === "industry" && (
              <div>
                <label className="block ml-1 mb-1 font-medium">{STEP_TITLES.industry}</label>
                <Select value={industry} onValueChange={v => setIndustry(v)}>
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
            )}
            {STEPS[step] === "goals" && (
              <div>
                <label className="block ml-1 mb-1 font-medium">{STEP_TITLES.goals}</label>
                <RadioGroup value={goals} onValueChange={setGoals} className="gap-2">
                  {GOALS_OPTIONS.map(option => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={option} />
                      <label htmlFor={option} className="text-sm">{option}</label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}
            {STEPS[step] === "interests" && (
              <div>
                <label className="block ml-1 mb-1 font-medium">{STEP_TITLES.interests}</label>
                <Select value={interests} onValueChange={v => setInterests(v)}>
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
            )}
            {/* Error message */}
            {error && (
              <div className="text-destructive text-sm">{error}</div>
            )}
            <div className="flex justify-between mt-8 gap-2">
              {showBack ? (
                <Button type="button" variant="secondary" onClick={handleBack}>
                  Back
                </Button>
              ) : <span />}
              <Button type="submit" className="ml-auto">
                {isLast ? "Finish" : "Next"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
