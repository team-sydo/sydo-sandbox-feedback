
/**
 * Formate une date pour l'affichage
 * @param dateString - Date sous forme de chaîne
 * @returns Date formatée (ex: "28/03/2023 17:28")
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

/**
 * Formate un timecode (secondes) en format mm:ss
 * @param seconds - Nombre de secondes
 * @returns Timecode formaté (ex: "00:42")
 */
export const formatTimecode = (seconds: number | null): string => {
  if (seconds === null) return '';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};
