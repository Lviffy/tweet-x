
import React from "react";
import { cn } from "@/lib/utils";

interface OnboardingProgressBarProps {
  steps: string[];
  currentStep: number;
  stepDescriptions: Record<string, string>;
}

export const OnboardingProgressBar = ({ 
  steps, 
  currentStep, 
  stepDescriptions 
}: OnboardingProgressBarProps) => (
  <>
    <div className="text-2xl flex items-center gap-2">
      Onboarding
      <span className="ml-auto text-xs text-muted-foreground">
        Step {currentStep + 1} of {steps.length}
      </span>
    </div>
    
    {/* Progress bar with gaps */}
    <div className="flex items-center gap-2 mt-4">
      {steps.map((_, index) => (
        <div key={index} className="flex-1">
          <div
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              index <= currentStep ? "bg-primary" : "bg-muted"
            )}
          />
        </div>
      ))}
    </div>
    
    <div className="mt-2 text-muted-foreground text-sm">
      {stepDescriptions[steps[currentStep]]}
    </div>
  </>
);
