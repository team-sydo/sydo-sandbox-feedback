
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
