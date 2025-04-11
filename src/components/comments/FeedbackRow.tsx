
import { Pen, Trash2, Laptop, Smartphone, Tablet, Chrome, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TableRow, TableCell } from "@/components/ui/table";
import { type Feedback } from "@/hooks/useProjectComments";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FeedbackRowProps {
  feedback: Feedback;
  index: number;
  formatTimecode: (seconds: number | null) => string;
  onCheckboxChange: (id: string, currentStatus: boolean) => Promise<void>;
  onEditClick: (feedback: Feedback) => void;
  onDeleteClick: (feedback: Feedback) => void;
  onImageClick: (url: string, content: string) => void;
  displayActions: boolean;
}

export function FeedbackRow({
  feedback,
  index,
  formatTimecode,
  onCheckboxChange,
  onEditClick,
  onDeleteClick,
  onImageClick,
  displayActions,
}: FeedbackRowProps) {
  // Fonction pour obtenir le nom du commentateur
  const getCommenterName = () => {
    if (feedback.user && feedback.user.prenom && feedback.user.nom) {
      return `${feedback.user.prenom}`;
    } else if (feedback.guest && feedback.guest.prenom && feedback.guest.nom) {
      return `${feedback.guest.prenom} ${feedback.guest.nom}`;
    }
    return "Anonyme";
  };
  
  const getCommenterPoste = () => {
    if (feedback.guest && feedback.guest.poste) {
      return `${feedback.guest.poste}`;
    }
    return "";
  };

  // Fonction pour obtenir le titre du grain
  const getGrainTitle = () => {
    return feedback.grain?.title || "Inconnu";
  };

  // Fonction pour obtenir l'icône du device
  const getDeviceIcon = () => {
    const deviceType = feedback.user
      ? typeof feedback.user === "object" && "device" in feedback.user
        ? feedback.user.device
        : null
      : feedback.guest &&
        typeof feedback.guest === "object" &&
        "device" in feedback.guest
      ? feedback.guest.device
      : null;

    switch (deviceType) {
      case "mobile":
        return <Smartphone className="h-5 w-5 text-gray-600" />;
      case "tablette":
        return <Tablet className="h-5 w-5 text-gray-600" />;
      case "ordinateur":
      default:
        return <Laptop className="h-5 w-5 text-gray-600" />;
    }
  };

  // Fonction pour obtenir l'icône du navigateur
  const getBrowserIcon = () => {
    const browserType = feedback.user
      ? typeof feedback.user === "object" && "navigateur" in feedback.user
        ? feedback.user.navigateur
        : null
      : feedback.guest &&
        typeof feedback.guest === "object" &&
        "navigateur" in feedback.guest
      ? feedback.guest.navigateur
      : null;

    switch (browserType) {
      case "chrome":
        return <Chrome className="h-5 w-5 text-gray-600" />;
      case "firefox":
      case "safari":
      case "edge":
      case "arc":
      default:
        return <Image className="h-5 w-5 text-gray-600" />; // Use Image as a fallback for all other browsers
    }
  };

  // Fonction pour obtenir le texte du device pour le tooltip
  const getDeviceText = () => {
    const deviceType = feedback.user
      ? typeof feedback.user === "object" && "device" in feedback.user
        ? feedback.user.device
        : null
      : feedback.guest &&
        typeof feedback.guest === "object" &&
        "device" in feedback.guest
      ? feedback.guest.device
      : null;

    switch (deviceType) {
      case "mobile":
        return "Mobile";
      case "tablette":
        return "Tablette";
      case "ordinateur":
        return "Ordinateur";
      default:
        return "Non spécifié";
    }
  };

  // Fonction pour obtenir le texte du navigateur pour le tooltip
  const getBrowserText = () => {
    const browserType = feedback.user
      ? typeof feedback.user === "object" && "navigateur" in feedback.user
        ? feedback.user.navigateur
        : null
      : feedback.guest &&
        typeof feedback.guest === "object" &&
        "navigateur" in feedback.guest
      ? feedback.guest.navigateur
      : null;

    switch (browserType) {
      case "chrome":
        return "Chrome";
      case "firefox":
        return "Firefox";
      case "safari":
        return "Safari";
      case "edge":
        return "Edge";
      case "arc":
        return "Arc";
      default:
        return "Autre";
    }
  };

  return (
    <TableRow key={feedback.id} className={feedback.done ? "bg-green-50" : ""}>
      <TableCell>{index + 1}</TableCell>
      <TableCell>{getGrainTitle()}</TableCell>
      <TableCell>
        <div className="flex flex-col justify-center">
          <span className="w-full text-center">{getCommenterName()}</span>
          <span className="w-full text-center text-xs text-gray-500 font-italic">{getCommenterPoste()}</span>
          <div className="flex justify-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex justify-center">
                    {getDeviceIcon()}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getDeviceText()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex justify-center">
                    {getBrowserIcon()}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getBrowserText()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <p className="max-h-24 w-96 overflow-auto">{feedback.content}</p>
      </TableCell>
      <TableCell>
        {feedback.screenshot_url ? (
          <button
            onClick={() => onImageClick(feedback.screenshot_url!, feedback.content)}
            className="flex items-center gap-1 text-blue-500 hover:underline"
          >
            <img
              src={feedback.screenshot_url}
              alt="Capture"
              className="max-w-24 max-h-24 cursor-pointer hover:opacity-80 transition-opacity"
            />
          </button>
        ) : (
          <span className="text-gray-400"></span>
        )}
        {feedback.timecode !== null ? formatTimecode(feedback.timecode) : ""}
      </TableCell>
      
      {displayActions && (
        <TableCell>
          <div className="flex space-x-2 items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEditClick(feedback)}
              title="Modifier le commentaire"
            >
              <Pen className="h-4 w-4 text-blue-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteClick(feedback)}
              title="Supprimer le commentaire"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </TableCell>
      )}
      
      <TableCell className="text-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Checkbox 
                className="m-2"
                checked={feedback.done}
                onCheckedChange={() => onCheckboxChange(feedback.id, feedback.done)}
                aria-label={feedback.done ? "Marquer comme non traité" : "Marquer comme traité"}
              />
            </TooltipTrigger>
            <TooltipContent>
              {feedback.done ? "Commentaire traité" : "Marquer comme traité"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
    </TableRow>
  );
}
