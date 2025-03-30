
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  content: string;
}

export function ImagePreviewModal({
  isOpen,
  onClose,
  imageUrl,
  content,
}: ImagePreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[90vw]">
        <DialogHeader>
          <DialogTitle>Aperçu du commentaire</DialogTitle>
          <DialogClose onClick={onClose} className="absolute right-4 top-4">
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div className="max-h-[60vh] overflow-auto bg-gray-50 p-4 rounded-md border">
            <p className="whitespace-pre-line mb-4">{content}</p>
          </div>
          <div className="flex justify-center">
            <img
              src={imageUrl}
              alt="Capture d'écran"
              className="max-w-full max-h-[70vh] object-contain"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
