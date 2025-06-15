
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTweetGeneration } from '@/hooks/useTweetGeneration';

export const useTweetGeneratorSession = () => {
  const { sessionId } = useParams();
  const [sessionLoaded, setSessionLoaded] = useState(false);
  
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

  return {
    sessionId,
    sessionLoaded,
    isGenerating,
    generatedTweets,
    sessionParams,
    isLoadingSession,
    generateTweets,
    setGeneratedTweets
  };
};
