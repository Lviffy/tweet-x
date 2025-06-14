// Add debug log and error boundary to catch render errors

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2, Copy, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

console.log("TweetGenerator page mounted"); // Debug log

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<Error | null>(null);

  if (error) {
    return (
      <div className="p-8 text-red-600 text-center">
        <h2>Something went wrong while loading the Tweet Generator page.</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  try {
    return <>{children}</>;
  } catch (err) {
    setError(err as Error);
    return null;
  }
}

interface GeneratedTweet {
  id: string;
  content: string;
  type: 'single' | 'thread';
}

const TweetGenerator = () => {
  const navigate = useNavigate();
  const [handles, setHandles] = useState<string[]>(['']);
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('');
  const [format, setFormat] = useState('single');
  const [includeHashtags, setIncludeHashtags] = useState(false);
  const [includeEmojis, setIncludeEmojis] = useState(false);
  const [includeCTA, setIncludeCTA] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTweets, setGeneratedTweets] = useState<GeneratedTweet[]>([]);
  const { toast } = useToast();

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

  const addHandle = () => {
    if (handles.length < 3) {
      setHandles([...handles, '']);
    }
  };

  const updateHandle = (index: number, value: string) => {
    const newHandles = [...handles];
    newHandles[index] = value;
    setHandles(newHandles);
  };

  const removeHandle = (index: number) => {
    if (handles.length > 1) {
      setHandles(handles.filter((_, i) => i !== index));
    }
  };

  const generateTweets = async () => {
    if (!topic.trim() || !tone || handles.some(h => !h.trim())) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate API call - replace with actual Gemini API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockTweets: GeneratedTweet[] = [
        {
          id: '1',
          content: `🚀 Just shipped our MVP! Here's what I learned building in public:\n\n1/ Start before you're ready\n2/ Share your struggles, not just wins\n3/ Community > everything\n\n${includeHashtags ? '#BuildInPublic #Startup' : ''}`,
          type: format.includes('thread') ? 'thread' : 'single'
        },
        {
          id: '2',
          content: `The hardest part about building a startup isn't the code—it's the courage to hit "publish" ${includeEmojis ? '💪' : ''}\n\nEvery feature you ship is a bet on your vision. Make it count.${includeCTA ? '\n\nWhat are you building? Drop it below 👇' : ''}`,
          type: 'single'
        },
        {
          id: '3',
          content: `PSA: Your first 100 users won't come from Product Hunt ${includeEmojis ? '🎯' : ''}\n\nThey'll come from:\n• Direct outreach\n• Solving real problems\n• Being genuinely helpful\n\nStop optimizing for launches. Start optimizing for relationships.`,
          type: 'single'
        }
      ];

      setGeneratedTweets(mockTweets);
      toast({
        title: "Tweets Generated!",
        description: "Your founder-style tweets are ready."
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Tweet copied to clipboard."
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-gray-900/20 relative overflow-hidden">
      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header with Go Home button and Heading */}
          <div className="flex items-center justify-between mb-12 flex-wrap gap-4">
            <Button variant="outline" onClick={() => navigate("/")}>
              Go Home
            </Button>
            <div className="flex-1 flex justify-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-0 text-center w-full">
                Founder-Style{" "}
                <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Tweet Generator
                </span>
              </h1>
            </div>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Form */}
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
                    onChange={(e) => setTopic(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Tone */}
                <div className="space-y-2">
                  <Label>Tone *</Label>
                  <Select value={tone} onValueChange={setTone}>
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
                  <Select value={format} onValueChange={setFormat}>
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

                {/* Options */}
                <div className="space-y-3">
                  <Label>Additional Options</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hashtags"
                        checked={includeHashtags}
                        onCheckedChange={(checked) => setIncludeHashtags(checked === true)}
                      />
                      <Label htmlFor="hashtags">Include Hashtags</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="emojis"
                        checked={includeEmojis}
                        onCheckedChange={(checked) => setIncludeEmojis(checked === true)}
                      />
                      <Label htmlFor="emojis">Include Emojis</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cta"
                        checked={includeCTA}
                        onCheckedChange={(checked) => setIncludeCTA(checked === true)}
                      />
                      <Label htmlFor="cta">Add Call-to-Action</Label>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={generateTweets}
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
                      Generate Tweets
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">Generated Tweets</h3>
              {generatedTweets.length === 0 ? (
                <Card className="bg-background/80 backdrop-blur-sm border-white/10">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      Your generated tweets will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {generatedTweets.map((tweet, index) => (
                    <motion.div
                      key={tweet.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-background/80 backdrop-blur-sm border-white/10">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-sm text-muted-foreground">
                              Variation {index + 1}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(tweet.content)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {tweet.content}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={generateTweets}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Wrap the component in the error boundary
const WrappedTweetGenerator = () => (
  <ErrorBoundary>
    <TweetGenerator />
  </ErrorBoundary>
);

export default WrappedTweetGenerator;
