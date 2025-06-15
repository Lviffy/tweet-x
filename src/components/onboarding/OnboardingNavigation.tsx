
import React from "react";
import { Button } from "@/components/ui/button";

interface OnboardingNavigationProps {
  showBack: boolean;
  isLast: boolean;
  onBack: () => void;
  onNext: () => void;
  onFinish: () => void;
}

export const OnboardingNavigation = ({
  showBack,
  isLast,
  onBack,
  onNext,
  onFinish
}: OnboardingNavigationProps) => (
  <div className="flex justify-between mt-8 gap-4">
    {showBack ? (
      <Button type="button" variant="secondary" onClick={onBack} className="px-8">
        Back
      </Button>
    ) : <span />}
    <Button 
      type="submit" 
      className="ml-auto px-8"
      onClick={isLast ? onFinish : onNext}
    >
      {isLast ? "Finish" : "Next"}
    </Button>
  </div>
);
