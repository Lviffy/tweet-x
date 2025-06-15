
import React from 'react';
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Home } from "lucide-react";

interface TweetGeneratorHeaderProps {
  onHomeClick: () => void;
}

export const TweetGeneratorHeader = ({ onHomeClick }: TweetGeneratorHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-12 flex-wrap gap-4">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <Button variant="ghost" size="icon" onClick={onHomeClick} className="h-7 w-7">
          <Home className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 flex justify-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-0 text-center w-full">
          AI Tweet{" "}
          <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Generator
          </span>
        </h1>
      </div>
    </div>
  );
};
