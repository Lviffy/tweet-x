
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Routes, Route, useParams, Navigate } from "react-router-dom";
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

const Welcome = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-background via-background to-gray-900/20">
      <Card className="w-full max-w-md shadow-lg bg-background/90 border-white/10">
        <CardHeader>
          <CardTitle className="text-center">Welcome 👋</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-8 text-center text-muted-foreground">
            Let’s personalize your experience. This helps us create relevant tweets for you.
          </div>
          <button
            className="w-full bg-primary text-white py-2 rounded-lg transition-all hover:bg-primary/90"
            onClick={() => navigate("/onboarding/step/0")}
            data-testid="start-onboarding"
          >
            Get Started
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

const StepScreen = ({
  stepIndex,
  totalSteps,
  state,
  setState,
  handleNext,
  handleBack,
  handleFinish,
  error,
  setError
}: {
  stepIndex: number, totalSteps: number,
  state: any, setState: any,
  handleNext: () => void, handleBack: () => void, handleFinish: () => void, 
  error: string | null, setError: (err: string | null) => void
}) => {
  const showBack = stepIndex > 0;
  const isLast = stepIndex === totalSteps - 1;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-gray-900/20 px-4">
      <Card className="w-full max-w-2xl shadow-xl bg-background/90 backdrop-blur border-white/10">
        <CardHeader>
          <CardTitle>
            <OnboardingProgressBar 
              steps={STEPS}
              currentStep={stepIndex}
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
              currentStep={STEPS[stepIndex]}
              stepTitles={STEP_TITLES}
              {...state}
              {...setState}
              industryOptions={INDUSTRY_OPTIONS}
              goalsOptions={GOALS_OPTIONS}
              interestsOptions={INTERESTS_OPTIONS}
              toggleSelection={setState.toggleSelection}
            />
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

const OnboardingRouter = () => {
  const { profile, loading, saveProfile } = useUserProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { stepIndex } = useParams<{ stepIndex: string }>();
  const location = useLocation();

  // All onboarding state
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [industry, setIndustry] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setBio(profile.bio || "");
      setIndustry(profile.industry || "");
      setGoals(profile.goals ? profile.goals.split(",") : []);
      setInterests(profile.interests ? profile.interests.split(",") : []);
    }
  }, [profile]);

  const state = {
    displayName, setDisplayName,
    bio, setBio,
    industry, setIndustry,
    goals, setGoals,
    interests, setInterests,
    toggleSelection: (value: string, currentArray: string[], setter: (arr: string[]) => void) => {
      if (currentArray.includes(value)) {
        setter(currentArray.filter(item => item !== value));
      } else {
        setter([...currentArray, value]);
      }
    }
  };

  const currentStep = parseInt(stepIndex ?? "0", 10);

  const handleNext = () => {
    setError(null);
    switch (STEPS[currentStep]) {
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
    if (currentStep < STEPS.length - 1) {
      navigate(`/onboarding/step/${currentStep + 1}`);
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentStep > 0) navigate(`/onboarding/step/${currentStep - 1}`);
    else navigate("/onboarding");
  };

  const handleFinish = async () => {
    setError(null);
    if (!displayName.trim()) {
      setError("Display Name is required.");
      navigate("/onboarding/step/0");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white" />
      </div>
    );
  }

  if (!stepIndex) return <Navigate to="/onboarding" replace />;
  
  return (
    <StepScreen
      stepIndex={currentStep}
      totalSteps={STEPS.length}
      state={state}
      setState={state}
      handleNext={handleNext}
      handleBack={handleBack}
      handleFinish={handleFinish}
      error={error}
      setError={setError}
    />
  );
};

const Onboarding = () => (
  <Routes>
    <Route path="/" element={<Welcome />} />
    <Route path="/step/:stepIndex" element={<OnboardingRouter />} />
    <Route path="*" element={<Navigate to="/onboarding" />} />
  </Routes>
);

export default Onboarding;
