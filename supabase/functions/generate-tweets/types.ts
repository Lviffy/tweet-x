
export interface GeneratedTweet {
  id: string;
  content: string;
  type: 'single' | 'thread';
}

export interface TweetGenerationRequest {
  topic: string;
  tone: string;
  format: string;
  tweetCount: number;
  includeHashtags: boolean;
  includeEmojis: boolean;
  includeCTA: boolean;
}
