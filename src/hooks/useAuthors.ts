
import { useState, useEffect } from "react";
import { Author, Feedback } from "./useProjectComments";

export function useAuthors(feedbacks: Feedback[]) {
  const [authors, setAuthors] = useState<Author[]>([]);
  
  useEffect(() => {
    const tempAuthors: Author[] = [];
    
    feedbacks.forEach(feedback => {
      if (feedback.user_id && feedback.user) {
        if (!tempAuthors.some(author => author.id === feedback.user_id)) {
          tempAuthors.push({
            id: feedback.user_id,
            name: `${feedback.user.prenom} ${feedback.user.nom}`,
            device: feedback.user.device,
            navigateur: feedback.user.navigateur,
            poste: "",
            type: "user"
          });
        }
      }
      
      if (feedback.guest_id && feedback.guest) {
        if (!tempAuthors.some(author => author.id === feedback.guest_id)) {
          tempAuthors.push({
            id: feedback.guest_id,
            name: `${feedback.guest.prenom} ${feedback.guest.nom}`,
            device: feedback.guest.device,
            navigateur: feedback.guest.navigateur,
            poste: feedback.guest.poste,
            type: "guest"
          });
        }
      }
    });
    
    setAuthors(tempAuthors);
  }, [feedbacks]);
  
  return { authors };
}
