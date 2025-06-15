
export interface GeneratedTweet {
  id: string;
  content: string;
  type: 'single' | 'thread';
}

export interface TweetGenerationRequest {
  handles?: string[];
  topic: string;
  tone: string;
  format: string;
  tweetCount: number;
  length: string;
  includeHashtags: boolean;
  includeEmojis: boolean;
  includeCTA: boolean;
}

export interface ProfileData {
  id: string;
  handle: string;
  display_name: string | null;
  bio: string | null;
  writing_style_json: any;
  common_phrases: string[] | null;
  topic_areas: string[] | null;
  average_tweet_length: number | null;
  thread_percentage: number | null;
  emoji_usage: number | null;
}
