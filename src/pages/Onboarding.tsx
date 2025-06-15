
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";
import { OnboardingProgressBar } from "@/components/onboarding/OnboardingProgressBar";
import { OnboardingStepContent } from "@/components/onboarding/OnboardingStepContent";
import { OnboardingNavigation } from "@/components/onboarding/OnboardingNavigation";

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
      <Card className="w-full max-w-2xl shadow-xl bg-background/90 backdrop-blur border-white/10 transition-all duration-500">
        <CardHeader>
          <CardTitle>
            <OnboardingProgressBar 
              steps={STEPS}
              currentStep={step}
              stepDescriptions={STEP_DESCRIPTIONS}
            />
          </CardTitle>
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
            <OnboardingStepContent
              currentStep={STEPS[step]}
              stepTitles={STEP_TITLES}
              displayName={displayName}
              setDisplayName={setDisplayName}
              bio={bio}
              setBio={setBio}
              industry={industry}
              setIndustry={setIndustry}
              goals={goals}
              setGoals={setGoals}
              interests={interests}
              setInterests={setInterests}
              industryOptions={INDUSTRY_OPTIONS}
              goalsOptions={GOALS_OPTIONS}
              interestsOptions={INTERESTS_OPTIONS}
              toggleSelection={toggleSelection}
            />
            
            {/* Error message */}
            {error && (
              <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                {error}
              </div>
            )}
            
            <OnboardingNavigation
              showBack={showBack}
              isLast={isLast}
              onBack={handleBack}
              onNext={handleNext}
              onFinish={handleFinish}
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
