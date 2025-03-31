
import { Database } from "@/integrations/supabase/types";

export type BrowserType = Database["public"]["Enums"]["browser_type"];
export type DeviceType = Database["public"]["Enums"]["device_type"];

export interface Guest {
  id: string;
  prenom: string;
  nom: string;
  poste?: string | null;
  device: DeviceType;
  navigateur: BrowserType;
  project_id: string;
}

export interface Feedback {
  id: string;
  grain_id: string;
  content: string;
  timecode: number | null;
  screenshot_url: string | null;
  done: boolean;
  user_id: string | null;
  guest_id: string | null;
  created_at: string;
}
