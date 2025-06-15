
import { useState, useEffect } from 'react';

interface TweetFormParams {
  topic: string;
  tone: string;
  format: string;
  tweetCount: number;
  length: string;
  includeHashtags: boolean;
  includeEmojis: boolean;
  includeCTA: boolean;
}

export const useTweetFormState = (sessionParams: TweetFormParams | null) => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('');
  const [format, setFormat] = useState('single');
  const [tweetCount, setTweetCount] = useState(3);
  const [length, setLength] = useState('medium');
  const [includeHashtags, setIncludeHashtags] = useState(false);
  const [includeEmojis, setIncludeEmojis] = useState(false);
  const [includeCTA, setIncludeCTA] = useState(false);

  // Update form fields when session parameters are loaded
  useEffect(() => {
    if (sessionParams) {
      console.log('Updating form with session params:', sessionParams);
      setTopic(sessionParams.topic || '');
      setTone(sessionParams.tone || '');
      setFormat(sessionParams.format || 'single');
      setTweetCount(sessionParams.tweetCount || 3);
      setLength(sessionParams.length || 'medium');
      setIncludeHashtags(sessionParams.includeHashtags || false);
      setIncludeEmojis(sessionParams.includeEmojis || false);
      setIncludeCTA(sessionParams.includeCTA || false);
    }
  }, [sessionParams]);

  return {
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
  };
};
