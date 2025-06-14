
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, RefreshCw } from "lucide-react";

interface AddProfileFormProps {
  scraping: boolean;
  onAddProfile: (handle: string) => Promise<void>;
}

const AddProfileForm = ({ scraping, onAddProfile }: AddProfileFormProps) => {
  const [newHandle, setNewHandle] = useState('');

  const handleAddProfile = async () => {
    if (!newHandle.trim()) return;
    
    await onAddProfile(newHandle);
    setNewHandle('');
  };

  return (
    <Card className="border-dashed">
      <CardContent className="pt-6">
        <div className="flex gap-2">
          <Input
            placeholder="@username (e.g., @naval, @levelsio)"
            value={newHandle}
            onChange={(e) => setNewHandle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddProfile()}
            disabled={scraping}
          />
          <Button 
            onClick={handleAddProfile} 
            disabled={scraping || !newHandle.trim()}
          >
            {scraping ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </Button>
        </div>
        {scraping && (
          <p className="text-sm text-muted-foreground mt-2">
            Analyzing writing style and content patterns...
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AddProfileForm;
