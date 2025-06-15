import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2, RefreshCw } from "lucide-react";
import SpeechToTextButton from "@/components/SpeechToTextButton";

interface TweetFormProps {
  topic: string;
  tone: string;
  format: string;
  tweetCount: number;
  length: string;
  includeHashtags: boolean;
  includeEmojis: boolean;
  includeCTA: boolean;
  isGenerating: boolean;
  onTopicChange: (topic: string) => void;
  onToneChange: (tone: string) => void;
  onFormatChange: (format: string) => void;
  onTweetCountChange: (count: number) => void;
  onLengthChange: (length: string) => void;
  onIncludeHashtagsChange: (include: boolean) => void;
  onIncludeEmojisChange: (include: boolean) => void;
  onIncludeCTAChange: (include: boolean) => void;
  onGenerate: () => void;
}

const TweetForm = ({
  topic,
  tone,
  format,
  tweetCount,
  length,
  includeHashtags,
  includeEmojis,
  includeCTA,
  isGenerating,
  onTopicChange,
  onToneChange,
  onFormatChange,
  onTweetCountChange,
  onLengthChange,
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

  const lengthOptions = [
    { value: 'short', label: 'Short (1-2 lines)' },
    { value: 'medium', label: 'Medium (3-5 lines)' },
    { value: 'long', label: 'Long (6+ lines)' }
  ];

  const handleSpeechTranscript = (transcript: string) => {
    // Append the speech transcript to the existing topic
    const newTopic = topic ? `${topic} ${transcript}` : transcript;
    onTopicChange(newTopic.trim());
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
        {/* Topic */}
        <div className="space-y-2">
          <Label htmlFor="topic">Topic/Prompt *</Label>
          <div className="relative">
            <Textarea
              id="topic"
              placeholder="What should the tweet be about? (e.g., 'Announcing an MVP', 'Lessons from fundraising')"
              value={topic}
              onChange={(e) => onTopicChange(e.target.value)}
              rows={3}
            />
            <div className="absolute top-2 right-2">
              <SpeechToTextButton
                onTranscriptChange={handleSpeechTranscript}
                className="h-8 px-2"
              />
            </div>
          </div>
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

        {/* Length */}
        <div className="space-y-2">
          <Label>Tweet Length</Label>
          <Select value={length} onValueChange={onLengthChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {lengthOptions.map((option) => (
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
