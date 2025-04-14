
import React from "react";
import { Check, X, Pen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { type Feedback } from "@/hooks/useProjectComments";

interface FeedbacksListProps {
  feedbacks: Feedback[];
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  onDeleteFeedback: (id: string, guestId: string | null) => void;
  onEditFeedback: (feedback: Feedback) => void;
  onClose: () => void;
  isAuthenticated?: boolean;
  currentGuestId?: string | null;
}

export default function FeedbacksList({
  feedbacks,
  onToggleStatus,
  onDeleteFeedback,
  onEditFeedback,
  onClose,
  isAuthenticated = false,
  currentGuestId = null,
}: FeedbacksListProps) {
  const sortedFeedbacks = [...feedbacks].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Check if the current guest can edit/delete a feedback
  const canGuestModifyFeedback = (feedback: Feedback) => {
    if (isAuthenticated) return true;
    return currentGuestId && feedback.guest_id === currentGuestId;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Commentaires ({feedbacks.length})</h3>
        <button
          className="p-1 rounded-md hover:bg-gray-100"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {sortedFeedbacks.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              Aucun commentaire pour le moment
            </p>
          ) : (
            sortedFeedbacks.map((feedback) => {
              const author = feedback.user
                ? feedback.user.prenom
                : feedback.guest
                ? feedback.guest.prenom
                : "Anonyme";

              return (
                <div
                  key={feedback.id}
                  className={`p-4 rounded-lg border ${
                    feedback.done ? "bg-green-50" : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-medium">{author}</p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(
                          new Date(feedback.created_at),
                          { addSuffix: true, locale: fr }
                        )}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      {canGuestModifyFeedback(feedback) && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEditFeedback(feedback)}
                            className="h-6 w-6"
                            title="Modifier"
                          >
                            <Pen className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeleteFeedback(feedback.id, feedback.guest_id)}
                            className="h-6 w-6 text-red-500"
                            title="Supprimer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onToggleStatus(feedback.id, feedback.done)}
                        className={`h-6 w-6 ${
                          feedback.done
                            ? "text-green-500"
                            : "text-gray-500"
                        }`}
                        title={
                          feedback.done ? "Marquer comme non résolu" : "Marquer comme résolu"
                        }
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm mt-2">{feedback.content}</p>

                  {feedback.screenshot_url && (
                    <div className="mt-2">
                      <img
                        src={feedback.screenshot_url}
                        alt="Capture d'écran"
                        className="max-h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
