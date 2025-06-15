
import React from "react";
import { cn } from "@/lib/utils";

interface OptionBoxProps {
  option: string;
  isSelected: boolean;
  onClick: () => void;
}

export const OptionBox = ({ option, isSelected, onClick }: OptionBoxProps) => (
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
