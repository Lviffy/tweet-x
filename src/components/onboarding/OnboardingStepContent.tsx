
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OptionBox } from "./OptionBox";

interface OnboardingStepContentProps {
  currentStep: string;
  stepTitles: Record<string, string>;
  displayName: string;
  setDisplayName: (value: string) => void;
  bio: string;
  setBio: (value: string) => void;
  industry: string;
  setIndustry: (value: string) => void;
  goals: string[];
  setGoals: (goals: string[]) => void;
  interests: string[];
  setInterests: (interests: string[]) => void;
  industryOptions: string[];
  goalsOptions: string[];
  interestsOptions: string[];
  toggleSelection: (value: string, currentArray: string[], setter: (arr: string[]) => void) => void;
}

export const OnboardingStepContent = ({
  currentStep,
  stepTitles,
  displayName,
  setDisplayName,
  bio,
  setBio,
  industry,
  setIndustry,
  goals,
  setGoals,
  interests,
  setInterests,
  industryOptions,
  goalsOptions,
  interestsOptions,
  toggleSelection
}: OnboardingStepContentProps) => {
  if (currentStep === "displayName") {
    return (
      <div>
        <label htmlFor="displayName" className="block ml-1 mb-3 font-medium text-lg">
          {stepTitles.displayName} <span className="text-destructive">*</span>
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
    );
  }

  if (currentStep === "bio") {
    return (
      <div>
        <label htmlFor="bio" className="block ml-1 mb-3 font-medium text-lg">{stepTitles.bio}</label>
        <Textarea
          id="bio"
          value={bio}
          onChange={e => setBio(e.target.value)}
          rows={3}
          placeholder="e.g. Product Builder, AI Enthusiast"
          className="text-lg p-4"
        />
      </div>
    );
  }

  if (currentStep === "industry") {
    return (
      <div>
        <label className="block ml-1 mb-3 font-medium text-lg">{stepTitles.industry}</label>
        <Select value={industry} onValueChange={v => setIndustry(v)}>
          <SelectTrigger className="text-lg p-4 h-auto">
            <SelectValue placeholder="Select your industry" />
          </SelectTrigger>
          <SelectContent>
            {industryOptions.map(option => (
              <SelectItem key={option} value={option} className="text-lg p-3">{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (currentStep === "goals") {
    return (
      <div>
        <label className="block ml-1 mb-3 font-medium text-lg">{stepTitles.goals}</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {goalsOptions.map(option => (
            <OptionBox
              key={option}
              option={option}
              isSelected={goals.includes(option)}
              onClick={() => toggleSelection(option, goals, setGoals)}
            />
          ))}
        </div>
      </div>
    );
  }

  if (currentStep === "interests") {
    return (
      <div>
        <label className="block ml-1 mb-3 font-medium text-lg">{stepTitles.interests}</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {interestsOptions.map(option => (
            <OptionBox
              key={option}
              option={option}
              isSelected={interests.includes(option)}
              onClick={() => toggleSelection(option, interests, setInterests)}
            />
          ))}
        </div>
      </div>
    );
  }

  return null;
};
