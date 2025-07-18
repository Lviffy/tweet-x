export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      generated_tweets: {
        Row: {
          content: string
          created_at: string
          id: string
          position: number | null
          session_id: string
          starred: boolean
          type: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          position?: number | null
          session_id: string
          starred?: boolean
          type?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          position?: number | null
          session_id?: string
          starred?: boolean
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_tweets_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "tweet_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      scraped_profiles: {
        Row: {
          avatar_url: string | null
          average_tweet_length: number | null
          bio: string | null
          common_phrases: string[] | null
          created_at: string | null
          display_name: string | null
          emoji_usage: number | null
          handle: string
          id: string
          last_scraped_at: string | null
          thread_percentage: number | null
          topic_areas: string[] | null
          tweet_sample_count: number | null
          updated_at: string | null
          user_id: string
          verified: boolean | null
          writing_style_json: Json | null
        }
        Insert: {
          avatar_url?: string | null
          average_tweet_length?: number | null
          bio?: string | null
          common_phrases?: string[] | null
          created_at?: string | null
          display_name?: string | null
          emoji_usage?: number | null
          handle: string
          id?: string
          last_scraped_at?: string | null
          thread_percentage?: number | null
          topic_areas?: string[] | null
          tweet_sample_count?: number | null
          updated_at?: string | null
          user_id: string
          verified?: boolean | null
          writing_style_json?: Json | null
        }
        Update: {
          avatar_url?: string | null
          average_tweet_length?: number | null
          bio?: string | null
          common_phrases?: string[] | null
          created_at?: string | null
          display_name?: string | null
          emoji_usage?: number | null
          handle?: string
          id?: string
          last_scraped_at?: string | null
          thread_percentage?: number | null
          topic_areas?: string[] | null
          tweet_sample_count?: number | null
          updated_at?: string | null
          user_id?: string
          verified?: boolean | null
          writing_style_json?: Json | null
        }
        Relationships: []
      }
      scraped_tweets: {
        Row: {
          content: string
          created_at: string | null
          engagement_likes: number | null
          engagement_replies: number | null
          engagement_retweets: number | null
          has_emojis: boolean | null
          hashtags: string[] | null
          id: string
          is_thread: boolean | null
          position: number | null
          profile_id: string
          scraped_at: string
          tweet_length: number
        }
        Insert: {
          content: string
          created_at?: string | null
          engagement_likes?: number | null
          engagement_replies?: number | null
          engagement_retweets?: number | null
          has_emojis?: boolean | null
          hashtags?: string[] | null
          id?: string
          is_thread?: boolean | null
          position?: number | null
          profile_id: string
          scraped_at: string
          tweet_length: number
        }
        Update: {
          content?: string
          created_at?: string | null
          engagement_likes?: number | null
          engagement_replies?: number | null
          engagement_retweets?: number | null
          has_emojis?: boolean | null
          hashtags?: string[] | null
          id?: string
          is_thread?: boolean | null
          position?: number | null
          profile_id?: string
          scraped_at?: string
          tweet_length?: number
        }
        Relationships: [
          {
            foreignKeyName: "scraped_tweets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "scraped_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tweet_sessions: {
        Row: {
          created_at: string
          format: string | null
          handles: string[] | null
          id: string
          include_cta: boolean | null
          include_emojis: boolean | null
          include_hashtags: boolean | null
          length: string | null
          title: string
          tone: string | null
          topic: string | null
          tweet_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          format?: string | null
          handles?: string[] | null
          id?: string
          include_cta?: boolean | null
          include_emojis?: boolean | null
          include_hashtags?: boolean | null
          length?: string | null
          title: string
          tone?: string | null
          topic?: string | null
          tweet_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          format?: string | null
          handles?: string[] | null
          id?: string
          include_cta?: boolean | null
          include_emojis?: boolean | null
          include_hashtags?: boolean | null
          length?: string | null
          title?: string
          tone?: string | null
          topic?: string | null
          tweet_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
