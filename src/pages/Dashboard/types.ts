
export interface Project {
  id: string;
  title: string;
  description: string | null;
  active: boolean;
  created_at: string;
  client_id: string | null;
  client_name?: string | null;
  sites?: number;
  videos?: number;
  clients?: {
    id: string;
    nom: string;
  } | null;
}
