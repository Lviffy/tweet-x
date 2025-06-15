
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
  const { user, loading } = useAuth();
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('');
  const [format, setFormat] = useState('single');
  const [tweetCount, setTweetCount] = useState(3);
  const [includeHashtags, setIncludeHashtags] = useState(false);
  const [includeEmojis, setIncludeEmojis] = useState(false);
  const [includeCTA, setIncludeCTA] = useState(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const { toast } = useToast();

  const { 
    isGenerating, 
    generatedTweets, 
    sessionParams, 
    isLoadingSession,
    generateTweets, 
    loadSession, 
    clearSession,
    setGeneratedTweets 
  } = useTweetGeneration();

  // Load session only once when component mounts with sessionId
  useEffect(() => {
    if (sessionId && !sessionLoaded && !isLoadingSession) {
      console.log('Loading session:', sessionId);
      loadSession(sessionId).then(() => {
        setSessionLoaded(true);
      });
    } else if (!sessionId && !sessionLoaded) {
      // Clear session for new sessions
      clearSession();
      setSessionLoaded(true);
    }
  }, [sessionId, sessionLoaded, isLoadingSession, loadSession, clearSession]);

  // Update form fields when session parameters are loaded
  useEffect(() => {
    if (sessionParams) {
      console.log('Updating form with session params:', sessionParams);
      setTopic(sessionParams.topic || '');
      setTone(sessionParams.tone || '');
      setFormat(sessionParams.format || 'single');
      setTweetCount(sessionParams.tweetCount || 3);
      setIncludeHashtags(sessionParams.includeHashtags || false);
      setIncludeEmojis(sessionParams.includeEmojis || false);
      setIncludeCTA(sessionParams.includeCTA || false);
    }
  }, [sessionParams]);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use the tweet generator.",
        variant: "destructive"
      });
      navigate("/auth");
    }
  }, [user, loading, navigate, toast]);

  const handleGenerate = async () => {
    // Validate required fields
    if (!topic.trim()) {
      toast({
        title: "Missing Topic",
        description: "Please enter a topic for your tweets.",
        variant: "destructive"
      });
      return;
    }

    if (!tone) {
      toast({
        title: "Missing Tone",
        description: "Please select a tone for your tweets.",
        variant: "destructive"
      });
      return;
    }

    console.log('Generating tweets with params:', {
      topic: topic.trim(),
      tone,
      format,
      tweetCount,
      includeHashtags,
      includeEmojis,
      includeCTA
    });

    const newSessionId = await generateTweets({
      handles: [], // No longer using handles
      topic: topic.trim(),
      tone,
      format,
      tweetCount,
      includeHashtags,
      includeEmojis,
      includeCTA
    });

    if (newSessionId && !sessionId) {
      navigate(`/tweet-generator/${newSessionId}`, { replace: true });
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Tweet copied to clipboard."
    });
  };

  // Show loading spinner while checking authentication or loading session
  if (loading || isLoadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
        {isLoadingSession && (
          <p className="ml-4 text-white">Loading session...</p>
        )}
      </div>
    );
  }

  // Don't render anything if user is not authenticated
  if (!user) {
    return null;
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
                  topic={topic}
                  tone={tone}
                  format={format}
                  tweetCount={tweetCount}
                  includeHashtags={includeHashtags}
                  includeEmojis={includeEmojis}
                  includeCTA={includeCTA}
                  isGenerating={isGenerating}
                  onTopicChange={setTopic}
                  onToneChange={setTone}
                  onFormatChange={setFormat}
                  onTweetCountChange={setTweetCount}
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
