
import React from 'react';
import { Check, Video, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate, formatTimecode } from '@/lib/format-utils';

interface Feedback {
  id: string;
  content: string;
  created_at: string;
  done: boolean;
  timecode: number | null;
  screenshot_url: string | null;
}

interface FeedbacksListProps {
  feedbacks: Feedback[];
  onToggleStatus: (feedbackId: string, currentStatus: boolean) => Promise<void>;
  onClose: () => void;
}

const FeedbacksList: React.FC<FeedbacksListProps> = ({ 
  feedbacks, 
  onToggleStatus,
  onClose
}) => {
  if (feedbacks.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-semibold">Feedbacks</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-auto">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Aucun commentaire pour le moment
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="font-semibold">Feedbacks</h2>
        <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-auto">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {feedbacks.map((feedback) => (
          <div 
            key={feedback.id} 
            className="mb-4 p-4 border rounded-md bg-white shadow-sm"
          >
            <div className="text-sm text-gray-500 mb-1">
              {formatDate(feedback.created_at)}
            </div>
            
            {feedback.timecode !== null && (
              <div className="flex items-center text-xs text-gray-500 mb-1">
                <Video className="h-3 w-3 mr-1" />
                <span>Timecode: {formatTimecode(feedback.timecode)}</span>
              </div>
            )}
            
            <p className="mb-2 max-h-24 overflow-scroll">{feedback.content}</p>
            
            {feedback.screenshot_url && (
              <div className="mt-2 mb-3">
                <img 
                  src={feedback.screenshot_url} 
                  alt="Capture d'écran" 
                  className="max-h-32 rounded border"
                />
              </div>
            )}
            
            <div className="flex justify-end mt-2">
              <Button
                size="sm"
                variant={feedback.done ? "outline" : "default"}
                onClick={() => onToggleStatus(feedback.id, feedback.done)}
                className={feedback.done ? "text-gray-600" : ""}
              >
                {feedback.done ? "Rouvrir" : <Check className="h-4 w-4 mr-1" />}
                {!feedback.done && <span>Résolu</span>}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbacksList;
