
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2, RefreshCw } from "lucide-react";

interface TweetFormProps {
  handles: string[];
  topic: string;
  tone: string;
  format: string;
  tweetCount: number;
  includeHashtags: boolean;
  includeEmojis: boolean;
  includeCTA: boolean;
  isGenerating: boolean;
  onHandlesChange: (handles: string[]) => void;
  onTopicChange: (topic: string) => void;
  onToneChange: (tone: string) => void;
  onFormatChange: (format: string) => void;
  onTweetCountChange: (count: number) => void;
  onIncludeHashtagsChange: (include: boolean) => void;
  onIncludeEmojisChange: (include: boolean) => void;
  onIncludeCTAChange: (include: boolean) => void;
  onGenerate: () => void;
}

const TweetForm = ({
  handles,
  topic,
  tone,
  format,
  tweetCount,
  includeHashtags,
  includeEmojis,
  includeCTA,
  isGenerating,
  onHandlesChange,
  onTopicChange,
  onToneChange,
  onFormatChange,
  onTweetCountChange,
  onIncludeHashtagsChange,
  onIncludeEmojisChange,
  onIncludeCTAChange,
  onGenerate
}: TweetFormProps) => {
  const toneOptions = [
    { value: 'build-in-public', label: 'Build-in-Public' },
    { value: 'fundraising', label: 'Fundraising' },
    { value: 'inspirational', label: 'Inspirational' },
    { value: 'technical', label: 'Technical Deep-Dive' },
    { value: 'funny', label: 'Meme/Funny' }
  ];

  const formatOptions = [
    { value: 'single', label: 'Single Tweet' },
    { value: 'thread-3', label: '3-Tweet Thread' },
    { value: 'thread-5', label: '5-Tweet Thread' },
    { value: 'thread-10', label: '10-Tweet Thread' }
  ];

  const tweetCountOptions = [
    { value: 3, label: '3 Variations' },
    { value: 5, label: '5 Variations' },
    { value: 8, label: '8 Variations' },
    { value: 10, label: '10 Variations' }
  ];

  const addHandle = () => {
    if (handles.length < 3) {
      onHandlesChange([...handles, '']);
    }
  };

  const updateHandle = (index: number, value: string) => {
    const newHandles = [...handles];
    newHandles[index] = value;
    onHandlesChange(newHandles);
  };

  const removeHandle = (index: number) => {
    if (handles.length > 1) {
      onHandlesChange(handles.filter((_, i) => i !== index));
    }
  };

  return (
    <Card className="bg-background/80 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="w-5 h-5" />
          Tweet Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Twitter Handles */}
        <div className="space-y-2">
          <Label>Twitter Handles to Mimic (1-3)</Label>
          {handles.map((handle, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="@naval, @levelsio, etc."
                value={handle}
                onChange={(e) => updateHandle(index, e.target.value)}
                className="flex-1"
              />
              {handles.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeHandle(index)}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          {handles.length < 3 && (
            <Button variant="outline" size="sm" onClick={addHandle}>
              Add Handle
            </Button>
          )}
        </div>

        {/* Topic */}
        <div className="space-y-2">
          <Label htmlFor="topic">Topic/Prompt *</Label>
          <Textarea
            id="topic"
            placeholder="What should the tweet be about? (e.g., 'Announcing an MVP', 'Lessons from fundraising')"
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            rows={3}
          />
        </div>

        {/* Tone */}
        <div className="space-y-2">
          <Label>Tone *</Label>
          <Select value={tone} onValueChange={onToneChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select tone" />
            </SelectTrigger>
            <SelectContent>
              {toneOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Format */}
        <div className="space-y-2">
          <Label>Format</Label>
          <Select value={format} onValueChange={onFormatChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {formatOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tweet Count */}
        <div className="space-y-2">
          <Label>Number of Tweets to Generate</Label>
          <Select value={tweetCount.toString()} onValueChange={(value) => onTweetCountChange(parseInt(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tweetCountOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <Label>Additional Options</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hashtags"
                checked={includeHashtags}
                onCheckedChange={(checked) => onIncludeHashtagsChange(checked === true)}
              />
              <Label htmlFor="hashtags">Include Hashtags</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="emojis"
                checked={includeEmojis}
                onCheckedChange={(checked) => onIncludeEmojisChange(checked === true)}
              />
              <Label htmlFor="emojis">Include Emojis</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="cta"
                checked={includeCTA}
                onCheckedChange={(checked) => onIncludeCTAChange(checked === true)}
              />
              <Label htmlFor="cta">Add Call-to-Action</Label>
            </div>
          </div>
        </div>

        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate {tweetCount} Tweets
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TweetForm;
