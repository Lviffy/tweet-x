
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import TweetForm from "@/components/TweetForm";
import TweetResults from "@/components/TweetResults";

console.log("TweetGenerator page mounted");

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
            <TweetForm
              handles={handles}
              topic={topic}
              tone={tone}
              format={format}
              includeHashtags={includeHashtags}
              includeEmojis={includeEmojis}
              includeCTA={includeCTA}
              isGenerating={isGenerating}
              onHandlesChange={setHandles}
              onTopicChange={setTopic}
              onToneChange={setTone}
              onFormatChange={setFormat}
              onIncludeHashtagsChange={setIncludeHashtags}
              onIncludeEmojisChange={setIncludeEmojis}
              onIncludeCTAChange={setIncludeCTA}
              onGenerate={generateTweets}
            />

            {/* Results */}
            <TweetResults
              tweets={generatedTweets}
              isGenerating={isGenerating}
              onRegenerate={generateTweets}
              onCopyToClipboard={copyToClipboard}
            />
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
