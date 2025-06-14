
export interface GeneratedTweet {
  id: string;
  content: string;
  type: 'single' | 'thread';
}

export interface TweetGenerationRequest {
  handles: string[];
  topic: string;
  tone: string;
  format: string;
  tweetCount: number;
  includeHashtags: boolean;
  includeEmojis: boolean;
  includeCTA: boolean;
}

export interface ProfileData {
  handle: string;
  bio?: string;
  writing_style_json?: {
    commonStartPhrases?: string[];
    commonEndPhrases?: string[];
    toneKeywords?: string[];
    questionPatterns?: string[];
    ctaPatterns?: string[];
    averageWordsPerSentence?: number;
    sentencePatterns?: string[];
  };
  common_phrases?: string[];
  topic_areas?: string[];
  average_tweet_length?: number;
  thread_percentage?: number;
  emoji_usage?: number;
}
