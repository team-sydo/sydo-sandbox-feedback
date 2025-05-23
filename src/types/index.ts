
import { Constants } from "@/integrations/supabase/types";

// Define the Guest interface
export interface Guest {
  id: string;
  prenom: string;
  nom: string;
  poste: string | null;
  device: "mobile" | "ordinateur" | "tablette";
  navigateur: "chrome" | "edge" | "firefox" | "safari" | "autre";
  project_id: string;
}

// Define interface for favorites
export interface Favorite {
  id: string;
  user_id: string;
  project_id: string;
  created_at: string;
}

// Define Grain interface
export interface Grain {
  id: string;
  title: string;
  type: typeof Constants.public.Enums.grain_type[number];
  url: string;
  done: boolean;
  project_id: string;
  project?: {
    title: string;
  };
  created_at?: string;
  updated_at?: string;
  retour_on: boolean;
}

// Define Resource interface
export interface Resource {
  id: string;
  title: string;
  type: string;
  url: string;
  created_at: string;
  project_id: string;
}
