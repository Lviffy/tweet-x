
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTweetGeneration } from '@/hooks/useTweetGeneration';

export const useTweetGeneratorSession = () => {
  const { sessionId } = useParams();
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(undefined);
  
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

  // Load session when sessionId changes
  useEffect(() => {
    console.log('Session ID changed:', sessionId, 'Current:', currentSessionId);
    
    if (sessionId && sessionId !== currentSessionId && !isLoadingSession) {
      console.log('Loading new session:', sessionId);
      setCurrentSessionId(sessionId);
      loadSession(sessionId);
    } else if (!sessionId && currentSessionId) {
      // Clear session for new sessions
      console.log('Clearing session - new session detected');
      setCurrentSessionId(undefined);
      clearSession();
    }
  }, [sessionId, currentSessionId, isLoadingSession, loadSession, clearSession]);

  const handleGenerate = async (params: any) => {
    return await generateTweets(params, false);
  };

  const handleRegenerate = async (params: any) => {
    return await generateTweets(params, true);
  };

  return {
    sessionId,
    sessionLoaded: currentSessionId === sessionId,
    isGenerating,
    generatedTweets,
    sessionParams,
    isLoadingSession,
    generateTweets: handleGenerate,
    regenerateTweets: handleRegenerate,
    setGeneratedTweets
  };
};
