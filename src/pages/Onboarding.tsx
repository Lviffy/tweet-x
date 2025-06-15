
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

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
  interests: "What are your main interests?",
};

const STEP_DESCRIPTIONS: Record<string, string> = {
  displayName: "This is how others will see you.",
  bio: "A short bio helps us personalize your tweets.",
  industry: "Choose the industry that best fits you.",
  goals: "Pick what matters most to you (you can select multiple).",
  interests: "We'll use these to craft relevant tweets (select multiple).",
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
  const [goals, setGoals] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill if profile exists
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setBio(profile.bio || "");
      setIndustry(profile.industry || "");
      setGoals(profile.goals ? profile.goals.split(",") : []);
      setInterests(profile.interests ? profile.interests.split(",") : []);
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
        if (goals.length === 0) {
          setError("Please select at least one goal.");
          return;
        }
        break;
      case "interests":
        if (interests.length === 0) {
          setError("Please select at least one interest.");
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
      goals: goals.join(","),
      interests: interests.join(","),
    });
    toast({ title: "Profile saved!", description: "Your onboarding details were saved." });
    navigate("/");
  };

  const toggleSelection = (value: string, currentArray: string[], setter: (arr: string[]) => void) => {
    if (currentArray.includes(value)) {
      setter(currentArray.filter(item => item !== value));
    } else {
      setter([...currentArray, value]);
    }
  };

  const OptionBox = ({ option, isSelected, onClick }: { option: string; isSelected: boolean; onClick: () => void }) => (
    <div
      onClick={onClick}
      className={cn(
        "p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 text-center",
        isSelected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background hover:border-primary/50 hover:bg-primary/5"
      )}
    >
      <span className="text-sm font-medium">{option}</span>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white" />
      </div>
    );
  }

  const showBack = step > 0;
  const isLast = step === STEPS.length - 1;
  const progressPercentage = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-gray-900/20 px-4">
      <Card className="w-full max-w-2xl shadow-xl bg-background/90 backdrop-blur border-white/10 transition-all duration-500">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            Onboarding
            <span className="ml-auto text-xs text-muted-foreground">
              Step {step + 1} of {STEPS.length}
            </span>
          </CardTitle>
          
          {/* Progress bar with gaps */}
          <div className="flex items-center gap-2 mt-4">
            {STEPS.map((_, index) => (
              <div key={index} className="flex-1">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    index <= step ? "bg-primary" : "bg-muted"
                  )}
                />
              </div>
            ))}
          </div>
          
          <div className="mt-2 text-muted-foreground text-sm">
            {STEP_DESCRIPTIONS[STEPS[step]]}
          </div>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-6"
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
                <label htmlFor="displayName" className="block ml-1 mb-3 font-medium text-lg">
                  {STEP_TITLES.displayName} <span className="text-destructive">*</span>
                </label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  autoFocus
                  required
                  placeholder="e.g. Jane Doe"
                  className="text-lg p-4"
                />
              </div>
            )}
            
            {STEPS[step] === "bio" && (
              <div>
                <label htmlFor="bio" className="block ml-1 mb-3 font-medium text-lg">{STEP_TITLES.bio}</label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={3}
                  placeholder="e.g. Product Builder, AI Enthusiast"
                  className="text-lg p-4"
                />
              </div>
            )}
            
            {STEPS[step] === "industry" && (
              <div>
                <label className="block ml-1 mb-3 font-medium text-lg">{STEP_TITLES.industry}</label>
                <Select value={industry} onValueChange={v => setIndustry(v)}>
                  <SelectTrigger className="text-lg p-4 h-auto">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRY_OPTIONS.map(option => (
                      <SelectItem key={option} value={option} className="text-lg p-3">{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {STEPS[step] === "goals" && (
              <div>
                <label className="block ml-1 mb-3 font-medium text-lg">{STEP_TITLES.goals}</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {GOALS_OPTIONS.map(option => (
                    <OptionBox
                      key={option}
                      option={option}
                      isSelected={goals.includes(option)}
                      onClick={() => toggleSelection(option, goals, setGoals)}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {STEPS[step] === "interests" && (
              <div>
                <label className="block ml-1 mb-3 font-medium text-lg">{STEP_TITLES.interests}</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {INTERESTS_OPTIONS.map(option => (
                    <OptionBox
                      key={option}
                      option={option}
                      isSelected={interests.includes(option)}
                      onClick={() => toggleSelection(option, interests, setInterests)}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Error message */}
            {error && (
              <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                {error}
              </div>
            )}
            
            <div className="flex justify-between mt-8 gap-4">
              {showBack ? (
                <Button type="button" variant="secondary" onClick={handleBack} className="px-8">
                  Back
                </Button>
              ) : <span />}
              <Button type="submit" className="ml-auto px-8">
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
