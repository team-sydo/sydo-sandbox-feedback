
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { type Feedback } from "@/hooks/useProjectComments";
import { ImagePreviewModal } from "./ImagePreviewModal";
import { EditCommentModal } from "./EditCommentModal";
import { DeleteFeedbackDialog } from "./DeleteFeedbackDialog";
import { FeedbackRow } from "./FeedbackRow";

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
  const [feedbackToDelete, setFeedbackToDelete] = useState<Feedback | null>(null);

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

  const handleCheckboxChange = async (feedbackId: string, currentStatus: boolean) => {
    console.log("Checkbox clicked for", feedbackId, "current status:", currentStatus);
    await toggleFeedbackStatus(feedbackId, currentStatus);
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
            <TableHead className="w-16 text-center">Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {feedbacks.map((feedback, index) => (
            <FeedbackRow
              key={feedback.id}
              feedback={feedback}
              index={index}
              formatTimecode={formatTimecode}
              onCheckboxChange={handleCheckboxChange}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
              onImageClick={handleImageClick}
              displayActions={displayActions}
            />
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

      <DeleteFeedbackDialog
        isOpen={!!feedbackToDelete}
        onClose={() => setFeedbackToDelete(null)}
        onDelete={handleDeleteFeedback}
      />
    </div>
  );
}
