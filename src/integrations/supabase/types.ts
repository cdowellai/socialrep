export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_response_feedback: {
        Row: {
          created_at: string
          edited_response: string | null
          feedback_type: string
          id: string
          interaction_id: string | null
          original_response: string
          rating: number | null
          rejection_reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          edited_response?: string | null
          feedback_type: string
          id?: string
          interaction_id?: string | null
          original_response: string
          rating?: number | null
          rejection_reason?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          edited_response?: string | null
          feedback_type?: string
          id?: string
          interaction_id?: string | null
          original_response?: string
          rating?: number | null
          rejection_reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_response_feedback_interaction_id_fkey"
            columns: ["interaction_id"]
            isOneToOne: false
            referencedRelation: "interactions"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_rules: {
        Row: {
          action_config: Json
          action_type: string
          created_at: string
          description: string | null
          execution_count: number | null
          id: string
          is_active: boolean | null
          last_executed_at: string | null
          name: string
          priority: number | null
          trigger_conditions: Json
          trigger_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_config?: Json
          action_type: string
          created_at?: string
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          name: string
          priority?: number | null
          trigger_conditions?: Json
          trigger_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_config?: Json
          action_type?: string
          created_at?: string
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          name?: string
          priority?: number | null
          trigger_conditions?: Json
          trigger_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      brand_voice_samples: {
        Row: {
          content: string
          context: string | null
          created_at: string
          id: string
          is_active: boolean | null
          platform: string | null
          sample_type: string
          sentiment: string | null
          user_id: string
        }
        Insert: {
          content: string
          context?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          platform?: string | null
          sample_type: string
          sentiment?: string | null
          user_id: string
        }
        Update: {
          content?: string
          context?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          platform?: string | null
          sample_type?: string
          sentiment?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chatbot_conversations: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          metadata: Json | null
          started_at: string
          status: string
          user_id: string
          visitor_email: string | null
          visitor_id: string
          visitor_name: string | null
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          started_at?: string
          status?: string
          user_id: string
          visitor_email?: string | null
          visitor_id: string
          visitor_name?: string | null
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          started_at?: string
          status?: string
          user_id?: string
          visitor_email?: string | null
          visitor_id?: string
          visitor_name?: string | null
        }
        Relationships: []
      }
      chatbot_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          sentiment: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          sentiment?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          sentiment?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chatbot_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_settings: {
        Row: {
          auto_reply_delay_ms: number
          collect_email: boolean
          collect_name: boolean
          created_at: string
          id: string
          is_enabled: boolean
          position: string
          primary_color: string | null
          updated_at: string
          user_id: string
          welcome_message: string
          widget_title: string
        }
        Insert: {
          auto_reply_delay_ms?: number
          collect_email?: boolean
          collect_name?: boolean
          created_at?: string
          id?: string
          is_enabled?: boolean
          position?: string
          primary_color?: string | null
          updated_at?: string
          user_id: string
          welcome_message?: string
          widget_title?: string
        }
        Update: {
          auto_reply_delay_ms?: number
          collect_email?: boolean
          collect_name?: boolean
          created_at?: string
          id?: string
          is_enabled?: boolean
          position?: string
          primary_color?: string | null
          updated_at?: string
          user_id?: string
          welcome_message?: string
          widget_title?: string
        }
        Relationships: []
      }
      connected_platforms: {
        Row: {
          access_token: string | null
          created_at: string
          id: string
          is_active: boolean | null
          last_synced_at: string | null
          platform: Database["public"]["Enums"]["interaction_platform"]
          platform_account_id: string | null
          platform_account_name: string | null
          refresh_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          platform: Database["public"]["Enums"]["interaction_platform"]
          platform_account_id?: string | null
          platform_account_name?: string | null
          refresh_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          platform?: Database["public"]["Enums"]["interaction_platform"]
          platform_account_id?: string | null
          platform_account_name?: string | null
          refresh_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      interactions: {
        Row: {
          assigned_to: string | null
          author_avatar: string | null
          author_handle: string | null
          author_name: string | null
          content: string
          created_at: string
          external_id: string | null
          id: string
          interaction_type: Database["public"]["Enums"]["interaction_type"]
          metadata: Json | null
          parent_interaction_id: string | null
          platform: Database["public"]["Enums"]["interaction_platform"]
          post_url: string | null
          responded_at: string | null
          response: string | null
          sentiment: Database["public"]["Enums"]["sentiment_type"] | null
          sentiment_score: number | null
          status: Database["public"]["Enums"]["interaction_status"] | null
          updated_at: string
          urgency_score: number | null
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          author_avatar?: string | null
          author_handle?: string | null
          author_name?: string | null
          content: string
          created_at?: string
          external_id?: string | null
          id?: string
          interaction_type: Database["public"]["Enums"]["interaction_type"]
          metadata?: Json | null
          parent_interaction_id?: string | null
          platform: Database["public"]["Enums"]["interaction_platform"]
          post_url?: string | null
          responded_at?: string | null
          response?: string | null
          sentiment?: Database["public"]["Enums"]["sentiment_type"] | null
          sentiment_score?: number | null
          status?: Database["public"]["Enums"]["interaction_status"] | null
          updated_at?: string
          urgency_score?: number | null
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          author_avatar?: string | null
          author_handle?: string | null
          author_name?: string | null
          content?: string
          created_at?: string
          external_id?: string | null
          id?: string
          interaction_type?: Database["public"]["Enums"]["interaction_type"]
          metadata?: Json | null
          parent_interaction_id?: string | null
          platform?: Database["public"]["Enums"]["interaction_platform"]
          post_url?: string | null
          responded_at?: string | null
          response?: string | null
          sentiment?: Database["public"]["Enums"]["sentiment_type"] | null
          sentiment_score?: number | null
          status?: Database["public"]["Enums"]["interaction_status"] | null
          updated_at?: string
          urgency_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interactions_parent_interaction_id_fkey"
            columns: ["parent_interaction_id"]
            isOneToOne: false
            referencedRelation: "interactions"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          company: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          crm_id: string | null
          id: string
          notes: string | null
          score: number | null
          source_interaction_id: string | null
          source_platform:
            | Database["public"]["Enums"]["interaction_platform"]
            | null
          status: Database["public"]["Enums"]["lead_status"] | null
          synced_to_crm: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          crm_id?: string | null
          id?: string
          notes?: string | null
          score?: number | null
          source_interaction_id?: string | null
          source_platform?:
            | Database["public"]["Enums"]["interaction_platform"]
            | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          synced_to_crm?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          crm_id?: string | null
          id?: string
          notes?: string | null
          score?: number | null
          source_interaction_id?: string | null
          source_platform?:
            | Database["public"]["Enums"]["interaction_platform"]
            | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          synced_to_crm?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_source_interaction_id_fkey"
            columns: ["source_interaction_id"]
            isOneToOne: false
            referencedRelation: "interactions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          auto_respond_chatbot: boolean
          auto_respond_comments: boolean
          auto_respond_messages: boolean
          auto_respond_reviews: boolean
          auto_response_delay_ms: number
          avatar_url: string | null
          brand_voice: string | null
          company_name: string | null
          created_at: string
          current_team_id: string | null
          email: string
          full_name: string | null
          id: string
          lead_keywords: string[] | null
          monthly_interactions_limit: number | null
          monthly_interactions_used: number | null
          plan: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_respond_chatbot?: boolean
          auto_respond_comments?: boolean
          auto_respond_messages?: boolean
          auto_respond_reviews?: boolean
          auto_response_delay_ms?: number
          avatar_url?: string | null
          brand_voice?: string | null
          company_name?: string | null
          created_at?: string
          current_team_id?: string | null
          email: string
          full_name?: string | null
          id?: string
          lead_keywords?: string[] | null
          monthly_interactions_limit?: number | null
          monthly_interactions_used?: number | null
          plan?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_respond_chatbot?: boolean
          auto_respond_comments?: boolean
          auto_respond_messages?: boolean
          auto_respond_reviews?: boolean
          auto_response_delay_ms?: number
          avatar_url?: string | null
          brand_voice?: string | null
          company_name?: string | null
          created_at?: string
          current_team_id?: string | null
          email?: string
          full_name?: string | null
          id?: string
          lead_keywords?: string[] | null
          monthly_interactions_limit?: number | null
          monthly_interactions_used?: number | null
          plan?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_team_id_fkey"
            columns: ["current_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      response_templates: {
        Row: {
          category: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          template: string
          updated_at: string
          usage_count: number | null
          user_id: string
          variables: string[] | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          template: string
          updated_at?: string
          usage_count?: number | null
          user_id: string
          variables?: string[] | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          template?: string
          updated_at?: string
          usage_count?: number | null
          user_id?: string
          variables?: string[] | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          content: string | null
          created_at: string
          external_id: string | null
          id: string
          is_featured: boolean | null
          platform: Database["public"]["Enums"]["interaction_platform"]
          rating: number | null
          responded_at: string | null
          response: string | null
          review_url: string | null
          reviewer_avatar: string | null
          reviewer_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          external_id?: string | null
          id?: string
          is_featured?: boolean | null
          platform: Database["public"]["Enums"]["interaction_platform"]
          rating?: number | null
          responded_at?: string | null
          response?: string | null
          review_url?: string | null
          reviewer_avatar?: string | null
          reviewer_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          external_id?: string | null
          id?: string
          is_featured?: boolean | null
          platform?: Database["public"]["Enums"]["interaction_platform"]
          rating?: number | null
          responded_at?: string | null
          response?: string | null
          review_url?: string | null
          reviewer_avatar?: string | null
          reviewer_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stream_read_state: {
        Row: {
          created_at: string
          id: string
          last_interaction_read_at: string | null
          stream_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_interaction_read_at?: string | null
          stream_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_interaction_read_at?: string | null
          stream_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stream_read_state_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
        ]
      }
      streams: {
        Row: {
          auto_sort_by_urgency: boolean | null
          color: string | null
          connected_platform_id: string | null
          created_at: string
          filters: Json | null
          id: string
          interaction_types: string[] | null
          is_collapsed: boolean | null
          last_read_at: string | null
          name: string
          notifications_enabled: boolean
          notifications_muted: boolean
          platform: string | null
          position: number
          show_ai_suggestions: boolean | null
          sidebar_position: number
          team_id: string | null
          unread_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_sort_by_urgency?: boolean | null
          color?: string | null
          connected_platform_id?: string | null
          created_at?: string
          filters?: Json | null
          id?: string
          interaction_types?: string[] | null
          is_collapsed?: boolean | null
          last_read_at?: string | null
          name: string
          notifications_enabled?: boolean
          notifications_muted?: boolean
          platform?: string | null
          position?: number
          show_ai_suggestions?: boolean | null
          sidebar_position?: number
          team_id?: string | null
          unread_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_sort_by_urgency?: boolean | null
          color?: string | null
          connected_platform_id?: string | null
          created_at?: string
          filters?: Json | null
          id?: string
          interaction_types?: string[] | null
          is_collapsed?: boolean | null
          last_read_at?: string | null
          name?: string
          notifications_enabled?: boolean
          notifications_muted?: boolean
          platform?: string | null
          position?: number
          show_ai_suggestions?: boolean | null
          sidebar_position?: number
          team_id?: string | null
          unread_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "streams_connected_platform_id_fkey"
            columns: ["connected_platform_id"]
            isOneToOne: false
            referencedRelation: "connected_platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "streams_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["team_role"]
          team_id: string
          token: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["team_role"]
          team_id: string
          token?: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["team_role"]
          team_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          accepted_at: string | null
          created_at: string
          id: string
          invited_at: string
          invited_by: string | null
          role: Database["public"]["Enums"]["team_role"]
          team_id: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invited_at?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["team_role"]
          team_id: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invited_at?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["team_role"]
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_team_id: { Args: { _user_id: string }; Returns: string }
      has_team_role: {
        Args: {
          _role: Database["public"]["Enums"]["team_role"]
          _team_id: string
          _user_id: string
        }
        Returns: boolean
      }
      is_team_admin: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      is_team_member: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      interaction_platform:
        | "facebook"
        | "instagram"
        | "twitter"
        | "linkedin"
        | "google"
        | "yelp"
        | "tripadvisor"
        | "other"
        | "trustpilot"
        | "g2"
        | "capterra"
        | "bbb"
        | "glassdoor"
        | "amazon"
        | "appstore"
        | "playstore"
        | "tiktok"
        | "youtube"
      interaction_status: "pending" | "responded" | "escalated" | "archived"
      interaction_type: "comment" | "dm" | "mention" | "review" | "post"
      lead_status: "new" | "contacted" | "qualified" | "converted" | "lost"
      sentiment_type: "positive" | "neutral" | "negative"
      team_role: "owner" | "admin" | "member" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      interaction_platform: [
        "facebook",
        "instagram",
        "twitter",
        "linkedin",
        "google",
        "yelp",
        "tripadvisor",
        "other",
        "trustpilot",
        "g2",
        "capterra",
        "bbb",
        "glassdoor",
        "amazon",
        "appstore",
        "playstore",
        "tiktok",
        "youtube",
      ],
      interaction_status: ["pending", "responded", "escalated", "archived"],
      interaction_type: ["comment", "dm", "mention", "review", "post"],
      lead_status: ["new", "contacted", "qualified", "converted", "lost"],
      sentiment_type: ["positive", "neutral", "negative"],
      team_role: ["owner", "admin", "member", "viewer"],
    },
  },
} as const
