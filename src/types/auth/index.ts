import { Database } from '@/integrations/supabase/types';

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Client {
  id: string;
  nom: string;
  user_id: string;
  created_at: string;
}

export type UserRow = Database['public']['Tables']['users']['Row'];
export type ClientRow = Database['public']['Tables']['clients']['Row'];
export type ClientInsert = Database['public']['Tables']['clients']['Insert'];
export type ClientUpdate = Database['public']['Tables']['clients']['Update'];
