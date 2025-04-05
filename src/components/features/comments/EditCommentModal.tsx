
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { type Feedback } from "@/hooks/useProjectComments";

interface EditCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: Feedback;
  onSave: (id: string, content: string) => Promise<void>;
}

export function EditCommentModal({
  isOpen,
  onClose,
  feedback,
  onSave,
}: EditCommentModalProps) {
  const [content, setContent] = useState(feedback.content);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) return;
    
    setIsSaving(true);
    try {
      await onSave(feedback.id, content);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du commentaire:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl w-[90vw]">
        <DialogHeader>
          <DialogTitle>Modifier le commentaire</DialogTitle>
          <DialogClose onClick={onClose} className="absolute right-4 top-4">
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Contenu du commentaire..."
            className="min-h-[200px]"
          />
          
          {feedback.screenshot_url && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Capture d'écran associée</h3>
              <div className="flex justify-center bg-gray-50 p-2 rounded-md border">
                <img
                  src={feedback.screenshot_url}
                  alt="Capture d'écran"
                  className="max-w-full max-h-[200px] object-contain"
                />
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
