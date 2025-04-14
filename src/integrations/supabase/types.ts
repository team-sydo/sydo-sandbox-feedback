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
      clients: {
        Row: {
          created_at: string | null
          id: string
          nom: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nom: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nom?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      feedbacks: {
        Row: {
          content: string
          created_at: string
          done: boolean
          grain_id: string
          guest_id: string | null
          id: string
          project_id: string | null
          screenshot_url: string | null
          timecode: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          done?: boolean
          grain_id: string
          guest_id?: string | null
          id?: string
          project_id?: string | null
          screenshot_url?: string | null
          timecode?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          done?: boolean
          grain_id?: string
          guest_id?: string | null
          id?: string
          project_id?: string | null
          screenshot_url?: string | null
          timecode?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedbacks_grain_id_fkey"
            columns: ["grain_id"]
            isOneToOne: false
            referencedRelation: "grains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedbacks_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedbacks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      grains: {
        Row: {
          created_at: string
          done: boolean
          id: string
          project_id: string
          title: string
          type: Database["public"]["Enums"]["grain_type"]
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          done?: boolean
          id?: string
          project_id: string
          title: string
          type: Database["public"]["Enums"]["grain_type"]
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          done?: boolean
          id?: string
          project_id?: string
          title?: string
          type?: Database["public"]["Enums"]["grain_type"]
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "grains_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      guests: {
        Row: {
          created_at: string
          device: Database["public"]["Enums"]["device_type"]
          id: string
          navigateur: Database["public"]["Enums"]["browser_type"]
          nom: string
          poste: string | null
          prenom: string
          project_id: string
        }
        Insert: {
          created_at?: string
          device: Database["public"]["Enums"]["device_type"]
          id?: string
          navigateur: Database["public"]["Enums"]["browser_type"]
          nom: string
          poste?: string | null
          prenom: string
          project_id: string
        }
        Update: {
          created_at?: string
          device?: Database["public"]["Enums"]["device_type"]
          id?: string
          navigateur?: Database["public"]["Enums"]["browser_type"]
          nom?: string
          poste?: string | null
          prenom?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          active: boolean
          client_id: string | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          title: string
          user_id: string
        }
        Insert: {
          active?: boolean
          client_id?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          title: string
          user_id: string
        }
        Update: {
          active?: boolean
          client_id?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          device: Database["public"]["Enums"]["device_type"] | null
          id: string
          mail: string
          navigateur: Database["public"]["Enums"]["browser_type"] | null
          nom: string
          prenom: string
        }
        Insert: {
          device?: Database["public"]["Enums"]["device_type"] | null
          id: string
          mail: string
          navigateur?: Database["public"]["Enums"]["browser_type"] | null
          nom: string
          prenom: string
        }
        Update: {
          device?: Database["public"]["Enums"]["device_type"] | null
          id?: string
          mail?: string
          navigateur?: Database["public"]["Enums"]["browser_type"] | null
          nom?: string
          prenom?: string
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
      browser_type: "chrome" | "edge" | "firefox" | "safari" | "autre" | "arc"
      device_type: "mobile" | "ordinateur" | "tablette"
      grain_type: "web" | "video" | "figma" | "GSlide" | "pdf"
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
    Enums: {
      browser_type: ["chrome", "edge", "firefox", "safari", "autre", "arc"],
      device_type: ["mobile", "ordinateur", "tablette"],
      grain_type: ["web", "video", "figma", "GSlide", "pdf"],
    },
  },
} as const
