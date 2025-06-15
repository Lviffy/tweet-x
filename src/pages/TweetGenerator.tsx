
import React from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import TweetForm from "@/components/TweetForm";
import TweetResults from "@/components/TweetResults";
import { TweetGeneratorSidebar } from "@/components/TweetGeneratorSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { TweetGeneratorHeader } from "@/components/TweetGeneratorHeader";
import { useTweetFormState } from "@/hooks/useTweetFormState";
import { useTweetGeneratorNavigation } from "@/hooks/useTweetGeneratorNavigation";
import { useTweetGeneratorSession } from "@/hooks/useTweetGeneratorSession";

console.log("TweetGenerator page mounted");

const TweetGenerator = () => {
  const { user, loading, navigateHome, navigate } = useTweetGeneratorNavigation();
  const { toast } = useToast();
  
  const {
    sessionId,
    isGenerating,
    generatedTweets,
    sessionParams,
    isLoadingSession,
    generateTweets
  } = useTweetGeneratorSession();

  const {
    topic,
    tone,
    format,
    tweetCount,
    length,
    includeHashtags,
    includeEmojis,
    includeCTA,
    setTopic,
    setTone,
    setFormat,
    setTweetCount,
    setLength,
    setIncludeHashtags,
    setIncludeEmojis,
    setIncludeCTA
  } = useTweetFormState(sessionParams);

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
      length,
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
      length,
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
        
        <main className="flex-1 overflow-hidden">
          <div className="container mx-auto px-6 py-12 h-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-6xl mx-auto h-full flex flex-col"
            >
              <TweetGeneratorHeader onHomeClick={navigateHome} />

              <div className="grid lg:grid-cols-2 gap-8 flex-1 min-h-0">
                {/* Input Form */}
                <div className="flex flex-col">
                  <TweetForm
                    topic={topic}
                    tone={tone}
                    format={format}
                    tweetCount={tweetCount}
                    length={length}
                    includeHashtags={includeHashtags}
                    includeEmojis={includeEmojis}
                    includeCTA={includeCTA}
                    isGenerating={isGenerating}
                    onTopicChange={setTopic}
                    onToneChange={setTone}
                    onFormatChange={setFormat}
                    onTweetCountChange={setTweetCount}
                    onLengthChange={setLength}
                    onIncludeHashtagsChange={setIncludeHashtags}
                    onIncludeEmojisChange={setIncludeEmojis}
                    onIncludeCTAChange={setIncludeCTA}
                    onGenerate={handleGenerate}
                  />
                </div>

                {/* Results */}
                <div className="flex flex-col min-h-0">
                  <TweetResults
                    tweets={generatedTweets}
                    isGenerating={isGenerating}
                    onRegenerate={handleGenerate}
                    onCopyToClipboard={copyToClipboard}
                  />
                </div>
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
