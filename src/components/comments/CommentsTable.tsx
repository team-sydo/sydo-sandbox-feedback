
import { useState } from "react";
import { Pen, Trash2, Image } from "lucide-react";
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

interface CommentsTableProps {
  feedbacks: Feedback[];
  toggleFeedbackStatus: (id: string, currentStatus: boolean) => Promise<void>;
  formatTimecode: (seconds: number | null) => string;
  updateFeedback: (id: string, content: string) => Promise<void>;
  deleteFeedback: (id: string) => Promise<void>;
}

export function CommentsTable({ 
  feedbacks, 
  toggleFeedbackStatus,
  formatTimecode,
  updateFeedback,
  deleteFeedback
}: CommentsTableProps) {
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    content: string;
  } | null>(null);
  
  const [feedbackToEdit, setFeedbackToEdit] = useState<Feedback | null>(null);
  const [feedbackToDelete, setFeedbackToDelete] = useState<Feedback | null>(null);

  const getCommenterName = (feedback: Feedback) => {
    if (feedback.user && feedback.user.prenom && feedback.user.nom) {
      return `${feedback.user.prenom} ${feedback.user.nom}`;
    } else if (feedback.guest && feedback.guest.prenom && feedback.guest.nom) {
      return `${feedback.guest.prenom} ${feedback.guest.nom}`;
    }
    return "Anonyme";
  };

  const getGrainTitle = (feedback: Feedback) => {
    return feedback.grain?.title || "Inconnu";
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
            <TableHead>Nom du commentateur</TableHead>
            <TableHead>Commentaire</TableHead>
            <TableHead>Capture</TableHead>
            <TableHead>Time Code</TableHead>
            <TableHead>Traité</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {feedbacks.map((feedback, index) => (
            <TableRow key={feedback.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{getGrainTitle(feedback)}</TableCell>
              <TableCell>{getCommenterName(feedback)}</TableCell>
              <TableCell><p className="max-h-24 overflow-auto">{feedback.content}</p></TableCell>
              <TableCell>
                {feedback.screenshot_url ? (
                  <button
                    onClick={() => handleImageClick(feedback.screenshot_url!, feedback.content)}
                    className="flex items-center gap-1 text-blue-500 hover:underline"
                  >
                    <img
                      src={feedback.screenshot_url}
                      alt="Capture"
                      className="max-w-24 max-h-24 cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  </button>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell>
                {feedback.timecode !== null
                  ? formatTimecode(feedback.timecode)
                  : "-"}
              </TableCell>
              <TableCell>
                <Checkbox
                  checked={feedback.done}
                  onCheckedChange={() =>
                    toggleFeedbackStatus(feedback.id, feedback.done)
                  }
                />
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
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
                </div>
              </TableCell>
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
      <AlertDialog open={!!feedbackToDelete} onOpenChange={(open) => !open && setFeedbackToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce commentaire ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFeedbackToDelete(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFeedback} className="bg-red-500 hover:bg-red-600">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
