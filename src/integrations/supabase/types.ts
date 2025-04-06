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
      courses: {
        Row: {
          content: Json | null
          created_at: string
          difficulty: string
          id: string
          purpose: string
          summary: string
          title: string
          user_id: string
        }
        Insert: {
          content?: Json | null
          created_at?: string
          difficulty: string
          id?: string
          purpose: string
          summary: string
          title: string
          user_id: string
        }
        Update: {
          content?: Json | null
          created_at?: string
          difficulty?: string
          id?: string
          purpose?: string
          summary?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      interview_analysis: {
        Row: {
          created_at: string
          facial_data: Json | null
          id: string
          interview_id: string
          language_feedback: string | null
          pronunciation_feedback: string | null
          recommendations: Json | null
          technical_feedback: string | null
        }
        Insert: {
          created_at?: string
          facial_data?: Json | null
          id?: string
          interview_id: string
          language_feedback?: string | null
          pronunciation_feedback?: string | null
          recommendations?: Json | null
          technical_feedback?: string | null
        }
        Update: {
          created_at?: string
          facial_data?: Json | null
          id?: string
          interview_id?: string
          language_feedback?: string | null
          pronunciation_feedback?: string | null
          recommendations?: Json | null
          technical_feedback?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_analysis_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "mock_interviews"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_questions: {
        Row: {
          created_at: string
          id: string
          interview_id: string
          order_number: number
          question: string
          user_answer: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          interview_id: string
          order_number: number
          question: string
          user_answer?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          interview_id?: string
          order_number?: number
          question?: string
          user_answer?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_questions_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "mock_interviews"
            referencedColumns: ["id"]
          },
        ]
      }
      mock_interviews: {
        Row: {
          completed: boolean | null
          created_at: string
          experience: string
          id: string
          job_role: string
          tech_stack: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          experience: string
          id?: string
          job_role: string
          tech_stack: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          experience?: string
          id?: string
          job_role?: string
          tech_stack?: string
          user_id?: string
        }
        Relationships: []
      }
      study_material: {
        Row: {
          course_id: string
          course_layout: Json | null
          course_type: string
          created_at: string
          created_by: string
          difficulty_level: string | null
          id: number
          status: string | null
          topic: string
        }
        Insert: {
          course_id: string
          course_layout?: Json | null
          course_type: string
          created_at?: string
          created_by: string
          difficulty_level?: string | null
          id?: number
          status?: string | null
          topic: string
        }
        Update: {
          course_id?: string
          course_layout?: Json | null
          course_type?: string
          created_at?: string
          created_by?: string
          difficulty_level?: string | null
          id?: number
          status?: string | null
          topic?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          is_member: boolean | null
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_member?: boolean | null
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_member?: boolean | null
          name?: string
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
