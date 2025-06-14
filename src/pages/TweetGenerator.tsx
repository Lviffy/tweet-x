
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import TweetForm from "@/components/TweetForm";
import TweetResults from "@/components/TweetResults";
import { TweetGeneratorSidebar } from "@/components/TweetGeneratorSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useTweetGeneration } from "@/hooks/useTweetGeneration";
import { useAuth } from "@/hooks/useAuth";

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

const TweetGenerator = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const { user } = useAuth();
  const [handles, setHandles] = useState<string[]>(['']);
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('');
  const [format, setFormat] = useState('single');
  const [includeHashtags, setIncludeHashtags] = useState(false);
  const [includeEmojis, setIncludeEmojis] = useState(false);
  const [includeCTA, setIncludeCTA] = useState(false);
  const { toast } = useToast();

  const { isGenerating, generatedTweets, generateTweets, loadSession } = useTweetGeneration();

  // Load session if sessionId is provided
  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId);
    }
  }, [sessionId]);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use the tweet generator.",
        variant: "destructive"
      });
      navigate("/auth");
    }
  }, [user, navigate, toast]);

  const handleGenerate = async () => {
    const newSessionId = await generateTweets({
      handles,
      topic,
      tone,
      format,
      includeHashtags,
      includeEmojis,
      includeCTA
    });

    if (newSessionId && !sessionId) {
      navigate(`/tweet-generator/${newSessionId}`);
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Tweet copied to clipboard."
    });
  };

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-gray-900/20">
        <TweetGeneratorSidebar />
        
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-6xl mx-auto"
            >
              {/* Header with Sidebar Toggle and Heading */}
              <div className="flex items-center justify-between mb-12 flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <SidebarTrigger />
                  <Button variant="outline" onClick={() => navigate("/")}>
                    Go Home
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
                  onGenerate={handleGenerate}
                />

                {/* Results */}
                <TweetResults
                  tweets={generatedTweets}
                  isGenerating={isGenerating}
                  onRegenerate={handleGenerate}
                  onCopyToClipboard={copyToClipboard}
                />
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

// Wrap the component in the error boundary
const WrappedTweetGenerator = () => (
  <ErrorBoundary>
    <TweetGenerator />
  </ErrorBoundary>
);

export default WrappedTweetGenerator;
