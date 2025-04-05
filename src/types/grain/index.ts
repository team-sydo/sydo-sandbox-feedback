import { Database } from '@/integrations/supabase/types';

export type GrainType = 'web' | 'video';

export interface Grain {
  id: string;
  title: string;
  type: GrainType;
  url: string;
  project_id: string;
  project?: {
    title: string;
  };
}

export interface GrainFeedback {
  id: string;
  grain_id: string;
  content: string;
  created_at: string;
  user_id: string;
  user?: {
    email: string;
  };
  client?: {
    nom: string;
  };
  screenshot_url: string | null;
  timecode: number | null;
  done: boolean;
}

export type GrainRow = Database['public']['Tables']['grains']['Row'];
export type GrainInsert = Database['public']['Tables']['grains']['Insert'];
export type GrainUpdate = Database['public']['Tables']['grains']['Update'];
