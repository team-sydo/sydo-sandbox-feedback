
import { useState } from "react";
import {
  Pen,
  Trash2,
  Image,
  Laptop,
  Smartphone,
  Tablet,
  Chrome,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { type Feedback } from "@/hooks/useProjectComments";
import { ImagePreviewModal } from "./ImagePreviewModal";
import { EditCommentModal } from "./EditCommentModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CommentsTableProps {
  feedbacks: Feedback[];
  toggleFeedbackStatus: (id: string, currentStatus: boolean) => Promise<void>;
  formatTimecode: (seconds: number | null) => string;
  updateFeedback: (id: string, content: string) => Promise<void>;
  deleteFeedback: (id: string) => Promise<void>;
  displayActions: boolean;
}

export function CommentsTable({
  feedbacks,
  toggleFeedbackStatus,
  formatTimecode,
  updateFeedback,
  deleteFeedback,
  displayActions
}: CommentsTableProps) {
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    content: string;
  } | null>(null);

  const [feedbackToEdit, setFeedbackToEdit] = useState<Feedback | null>(null);
  const [feedbackToDelete, setFeedbackToDelete] = useState<Feedback | null>(
    null
  );

  // Fonction pour obtenir le nom du commentateur
  const getCommenterName = (feedback: Feedback) => {
    if (feedback.user && feedback.user.prenom && feedback.user.nom) {
      return `${feedback.user.prenom}`;
    } else if (feedback.guest && feedback.guest.prenom && feedback.guest.nom) {
      return `${feedback.guest.prenom} ${feedback.guest.nom}`;
    }
    return "Anonyme";
  };
  const getCommenterPoste = (feedback: Feedback) => {
   if (feedback.guest && feedback.guest.poste) {
      return `${feedback.guest.poste}`;
    }
  };

  // Fonction pour obtenir le titre du grain
  const getGrainTitle = (feedback: Feedback) => {
    return feedback.grain?.title || "Inconnu";
  };

  // Fonction pour obtenir l'icône du device
  const getDeviceIcon = (feedback: Feedback) => {
    console.log(feedback.user);
    console.log(feedback.guest);
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
  const getBrowserIcon = (feedback: Feedback) => {
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
  const getDeviceText = (feedback: Feedback) => {
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
  const getBrowserText = (feedback: Feedback) => {
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

  const handleImageClick = (url: string, content: string) => {
    setSelectedImage({ url, content });
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const handleEditClick = (feedback: Feedback) => {
    setFeedbackToEdit(feedback);
  };

  const handleDeleteClick = (feedback: Feedback) => {
    setFeedbackToDelete(feedback);
  };

  const handleUpdateFeedback = async (id: string, content: string) => {
    await updateFeedback(id, content);
    setFeedbackToEdit(null);
  };

  const handleDeleteFeedback = async () => {
    if (feedbackToDelete) {
      await deleteFeedback(feedbackToDelete.id);
      setFeedbackToDelete(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Grain</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Commentaire</TableHead>
            <TableHead>Capture</TableHead>
            {displayActions && <TableHead className="w-16">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {feedbacks.map((feedback, index) => (
            <TableRow key={feedback.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{getGrainTitle(feedback)}</TableCell>
              <TableCell>
                <div className="flex flex-col justify-center">
                  <span className="w-full text-center">{getCommenterName(feedback)}</span>
                  <span className="w-full text-center text-xs text-gray-500 font-italic">{getCommenterPoste(feedback)}</span>
                  <div className="flex justify-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex justify-center">
                            {getDeviceIcon(feedback)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{getDeviceText(feedback)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex justify-center">
                            {getBrowserIcon(feedback)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{getBrowserText(feedback)}</p>
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
                    onClick={() =>
                      handleImageClick(
                        feedback.screenshot_url!,
                        feedback.content
                      )
                    }
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
                  {feedback.timecode !== null
                  ? formatTimecode(feedback.timecode)
                  : ""}
              </TableCell>
              {displayActions && <TableCell>
                <div className="flex space-x-2 items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick(feedback)}
                    title="Modifier le commentaire"
                  >
                    <Pen className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(feedback)}
                    title="Supprimer le commentaire"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                  <Checkbox 
                    className="m-2"
                    checked={feedback.done}
                    onCheckedChange={() =>
                      toggleFeedbackStatus(feedback.id, feedback.done)
                    }
                    aria-label={feedback.done ? "Marquer comme non traité" : "Marquer comme traité"}
                  />
                </div>
              </TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedImage && (
        <ImagePreviewModal
          isOpen={!!selectedImage}
          onClose={closeModal}
          imageUrl={selectedImage.url}
          content={selectedImage.content}
        />
      )}

      {feedbackToEdit && (
        <EditCommentModal
          isOpen={!!feedbackToEdit}
          onClose={() => setFeedbackToEdit(null)}
          feedback={feedbackToEdit}
          onSave={handleUpdateFeedback}
        />
      )}

      {/* Confirmation dialog for delete */}
      <AlertDialog
        open={!!feedbackToDelete}
        onOpenChange={(open) => !open && setFeedbackToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce commentaire ? Cette action
              est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFeedbackToDelete(null)}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFeedback}
              className="bg-red-500 hover:bg-red-600"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
