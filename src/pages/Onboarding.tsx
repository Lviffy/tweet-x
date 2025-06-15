import React, { useState, useEffect, Fragment } from "react";
import { useNavigate, useParams, Navigate, Routes, Route } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

// Step config
const STEPS = [
  {
    key: "displayName",
    label: "What's your display name?",
    description: "This is how others will see you.",
    required: true,
  },
  {
    key: "bio",
    label: "Tell us about yourself",
    description: "A short bio helps us personalize your tweets.",
    required: false,
  },
  {
    key: "industry",
    label: "Which industry are you in?",
    description: "Choose the industry that best fits you.",
    required: true,
    options: [
      "SaaS", "Education", "Healthcare", "Marketing", "AI/ML",
      "E-commerce", "Finance", "Technology", "Other"
    ]
  },
  {
    key: "goals",
    label: "What are your primary goals on Twitter?",
    description: "Pick what matters most to you (you can select multiple).",
    required: true,
    multiple: true,
    options: [
      "Grow my personal brand", "Find customers", "Connect with experts",
      "Share what I'm learning", "Get hired", "Network with peers", "Other"
    ]
  },
  {
    key: "interests",
    label: "What are your main interests?",
    description: "We'll use these to craft relevant tweets (select multiple).",
    required: true,
    multiple: true,
    options: [
      "AI", "Startups", "Marketing", "Tech news", "Personal development",
      "Productivity", "Finance", "Design", "Other"
    ]
  }
];

// Minimal Option Box
const ModernOptionBox = ({
  option, selected, onClick
}: { option: string, selected: boolean, onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={`transition-all border w-full rounded-xl p-4 mb-2 text-lg font-medium
      ${selected 
        ? "bg-primary/90 text-background border-primary shadow focus:ring-2 ring-offset-2 ring-primary"
        : "bg-background/70 text-foreground border-border hover:bg-muted/70"}`
    }
    style={{ minHeight: 56 }}
  >
    {option}
  </button>
);

// animation utility
const appearAnim = "animate-fade-in";

// Steps UI
const StepContent = ({
  step, state, setState
}: {
  step: typeof STEPS[number], state: any, setState: any
}) => {
  switch (step.key) {
    case "displayName":
      return (
        <div className={`space-y-3`}>
          <label htmlFor="displayName" className="block font-semibold text-2xl mb-1">{step.label} <span className="text-red-500">*</span></label>
          <div className="text-muted-foreground mb-2">{step.description}</div>
          <input
            id="displayName"
            value={state.displayName}
            onChange={e => setState.setDisplayName(e.target.value)}
            className="w-full rounded-lg border p-4 text-xl bg-background/60"
            autoFocus
            placeholder="e.g. Jane Doe"
          />
        </div>
      );
    case "bio":
      return (
        <div className="space-y-3">
          <label htmlFor="bio" className="block font-semibold text-2xl mb-1">{step.label}</label>
          <div className="text-muted-foreground mb-2">{step.description}</div>
          <textarea
            id="bio"
            value={state.bio}
            onChange={e => setState.setBio(e.target.value)}
            rows={4}
            className="w-full rounded-lg border p-4 text-lg bg-background/60"
            placeholder="e.g. Product Builder, AI Enthusiast"
            maxLength={280}
            style={{ resize: "none" }}
          />
        </div>
      );
    case "industry":
      return (
        <div className="space-y-3">
          <label className="block font-semibold text-2xl mb-1">{step.label} <span className="text-red-500">*</span></label>
          <div className="text-muted-foreground mb-2">{step.description}</div>
          <div className="flex flex-col gap-2">
            {step.options!.map(option => (
              <ModernOptionBox
                key={option}
                option={option}
                selected={state.industry === option}
                onClick={() => setState.setIndustry(option)}
              />
            ))}
          </div>
        </div>
      );
    case "goals":
      return (
        <div className="space-y-3">
          <label className="block font-semibold text-2xl mb-1">{step.label} <span className="text-red-500">*</span></label>
          <div className="text-muted-foreground mb-2">{step.description}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {step.options!.map(option => (
              <ModernOptionBox
                key={option}
                option={option}
                selected={state.goals.includes(option)}
                onClick={() =>
                  setState.setGoals(state.goals.includes(option)
                    ? state.goals.filter((g: string) => g !== option)
                    : [...state.goals, option])
                }
              />
            ))}
          </div>
        </div>
      );
    case "interests":
      return (
        <div className="space-y-3">
          <label className="block font-semibold text-2xl mb-1">{step.label} <span className="text-red-500">*</span></label>
          <div className="text-muted-foreground mb-2">{step.description}</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {step.options!.map(option => (
              <ModernOptionBox
                key={option}
                option={option}
                selected={state.interests.includes(option)}
                onClick={() =>
                  setState.setInterests(state.interests.includes(option)
                    ? state.interests.filter((i: string) => i !== option)
                    : [...state.interests, option])
                }
              />
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
};

// Step navigation
const StepNavigation = ({
  stepIndex, totalSteps, onBack, onNext, isLast, disabled
}: {
  stepIndex: number, totalSteps: number, onBack: () => void, onNext: () => void, isLast: boolean, disabled: boolean
}) => (
  <div className="flex items-center mt-10 gap-6">
    {stepIndex > 0
      ? <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 rounded-md text-base font-medium border bg-secondary hover:bg-secondary/80 transition"
        >Back</button>
      : <div className="w-20" />}
    <button
      type="submit"
      className={`px-7 py-3 rounded-md text-base font-semibold transition shadow
        ${disabled ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary text-background hover:bg-primary/80"}`}
      disabled={disabled}
    >
      {isLast ? "Finish" : "Next"}
    </button>
  </div>
);

// Progress
const ProgressCircles = ({
  currentStep
}: {
  currentStep: number
}) => (
  <div className="flex justify-center mb-7 mt-2 gap-3">
    {STEPS.map((s, i) => (
      <span
        key={s.key}
        className={`block h-3 w-3 rounded-full transition-all
          ${i === currentStep ? "bg-primary shadow-md scale-110" : "bg-muted/70"}`}
      />
    ))}
  </div>
);

// Main onboarding page
const OnboardingSteps = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, saveProfile } = useUserProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { stepIndex: rawStepIdx } = useParams<{ stepIndex: string }>();

  // State hooks for each step
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [industry, setIndustry] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // If we want to load pre-vetted data for "edit"
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setBio(profile.bio || "");
      setIndustry(profile.industry || "");
      setGoals(profile.goals ? profile.goals.split(",") : []);
      setInterests(profile.interests ? profile.interests.split(",") : []);
    }
  }, [profile]);

  // Central guards
  useEffect(() => {
    // Not logged in? => redirect to auth.
    if (!authLoading && !user) {
      navigate("/auth", { replace: true });
    }
    // Already onboarded? => redirect to main app.
    if (!profileLoading && user && profile) {
      navigate("/tweet-generator", { replace: true });
    }
    // If not loading and user exists and no profile, stay here.
  }, [user, authLoading, profile, profileLoading, navigate]);

  if (authLoading || profileLoading) return null;
  if (!user) return null;
  if (profile) return null;

  const stepIdx = Math.max(0, Math.min(STEPS.length - 1, parseInt(rawStepIdx ?? "0", 10)));
  const step = STEPS[stepIdx];

  // If invalid step, redirect to beginning to avoid undefined step
  if (!step) {
    navigate("/onboarding/step/0", { replace: true });
    return null;
  }

  const state = {
    displayName, setDisplayName,
    bio, setBio,
    industry, setIndustry,
    goals, setGoals,
    interests, setInterests,
  };

  // Error validation and helpers
  const isStepValid = () => {
    switch (step.key) {
      case "displayName":
        return !!displayName.trim();
      case "industry":
        return !!industry;
      case "goals":
        return goals.length > 0;
      case "interests":
        return interests.length > 0;
      default:
        return true;
    }
  };

  // NAVIGATION
  const handleBack = () => {
    setError(null);
    if (stepIdx <= 0) return navigate("/onboarding");
    navigate(`/onboarding/step/${stepIdx - 1}`);
  };

  const goToNextStep = () => {
    setError(null);
    if (!isStepValid()) {
      setError("Please complete this step.");
      return;
    }
    if (stepIdx < STEPS.length - 1) {
      navigate(`/onboarding/step/${stepIdx + 1}`);
    }
  };

  // Now, handle submission only from form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isStepValid()) {
      setError("Please complete this step.");
      return;
    }
    if (stepIdx < STEPS.length - 1) {
      goToNextStep();
      return;
    }
    // Last step: save profile and redirect
    await saveProfile({
      display_name: displayName,
      bio,
      industry,
      goals: goals.join(","),
      interests: interests.join(","),
    });
    toast({
      title: "Profile saved!",
      description: "Your onboarding details were saved.",
    });
    navigate("/tweet-generator");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-background to-gray-900/30 px-2 py-8">
      <Card className="w-full max-w-lg rounded-2xl bg-background/95 shadow-xl border border-white/10 animate-fade-in">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold tracking-tight mb-4">{step.label}</CardTitle>
        </CardHeader>
        <CardContent style={{ paddingLeft: 32, paddingRight: 32, paddingTop: 0, paddingBottom: 32 }}>
          <form onSubmit={handleSubmit} className="flex flex-col">
            <ProgressCircles currentStep={stepIdx} />
            <StepContent step={step} state={state} setState={state} />
            {error && (
              <div className="mt-5 text-red-500 bg-red-500/10 border border-red-500/30 p-3 rounded text-sm text-center">
                {error}
              </div>
            )}
            <StepNavigation
              stepIndex={stepIdx}
              totalSteps={STEPS.length}
              onBack={handleBack}
              onNext={goToNextStep}
              isLast={stepIdx === STEPS.length - 1}
              disabled={!isStepValid()}
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Welcome
const WelcomeScreen = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-gray-900/20 px-2">
      <Card className="w-full max-w-lg rounded-2xl bg-background/90 shadow-xl border border-white/10 animate-fade-in">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold tracking-tight mb-2">
            Welcome 👋
          </CardTitle>
        </CardHeader>
        <CardContent style={{ paddingLeft: 32, paddingRight: 32, paddingTop: 0, paddingBottom: 32 }}>
          <div className="mb-9 text-lg text-center text-muted-foreground">
            Let’s personalize your experience to help us create relevant tweets for you.
          </div>
          <button
            className="w-full py-3 rounded-xl text-lg font-semibold bg-primary text-background transition hover:bg-primary/80"
            onClick={() => navigate("/onboarding/step/0")}
          >
            Get Started
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

// Guard and router
const OnboardingRoot = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { replace: true });
    } else if (!profileLoading && user && profile) {
      navigate("/tweet-generator", { replace: true });
    } else if (!profileLoading && user && !profile) {
      navigate("/onboarding/step/0", { replace: true });
    }
  }, [user, profile, authLoading, profileLoading, navigate]);

  // Only render fallback, never visible UI
  return null;
};

// Main onboarding router
const Onboarding = () => (
  <Routes>
    <Route path="/" element={<OnboardingRoot />} />
    <Route path="/step/:stepIndex" element={<OnboardingSteps />} />
    <Route path="*" element={<WelcomeScreen />} />
  </Routes>
);

export default Onboarding;
