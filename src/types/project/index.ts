import { Database } from '@/integrations/supabase/types';

export interface Project {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  user_id: string;
}

export type ProjectRow = Database['public']['Tables']['projects']['Row'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];
