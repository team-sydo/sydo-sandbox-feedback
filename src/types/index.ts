
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
  type: "web" | "video" | "figma" | "GSlide" | "pdf";
  url: string;
  done: boolean;
  project_id: string;
  project?: {
    title: string;
  };
  created_at?: string;
  updated_at?: string;
}
