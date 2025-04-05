import { Database } from '@/integrations/supabase/types';

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  grain_id: string;
  screenshot_url?: string;
  timestamp?: number;
  user?: {
    email: string;
  };
  client?: {
    nom: string;
  };
}

export type CommentRow = Database['public']['Tables']['comments']['Row'];
export type CommentInsert = Database['public']['Tables']['comments']['Insert'];
export type CommentUpdate = Database['public']['Tables']['comments']['Update'];
