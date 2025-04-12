
import React, { useState } from 'react';
import { Check, Video, X, Pen, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate, formatTimecode } from '@/lib/format-utils';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Feedback } from '@/hooks/useProjectComments';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';

interface FeedbacksListProps {
  feedbacks: Feedback[];
  onToggleStatus: (feedbackId: string, currentStatus: boolean) => Promise<void>;
  onDeleteFeedback: (feedbackId: string) => void;
  onEditFeedback: (feedback: Feedback) => void;
  onClose: () => void;
}

const FeedbacksList: React.FC<FeedbacksListProps> = ({ 
  feedbacks, 
  onToggleStatus,
  onDeleteFeedback,
  onEditFeedback,
  onClose
}) => {
  const { user } = useAuth();
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  
  // Helper function to get commenter name
  const getCommenterName = (feedback: Feedback) => {
    if (feedback.user && feedback.user.prenom) {
      return `${feedback.user.prenom} ${feedback.user.nom || ''}`;
    } else if (feedback.guest && feedback.guest.prenom) {
      return `${feedback.guest.prenom} ${feedback.guest.nom || ''}`;
    }
    return "Anonyme";
  };
  
  // Filter feedbacks based on the switch state
  const filteredFeedbacks = showOnlyMine 
    ? feedbacks.filter(feedback => 
        (user && feedback.user_id === user.id)
      )
    : feedbacks;
  
  if (filteredFeedbacks.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-semibold">Feedbacks</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-auto">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Afficher uniquement mes commentaires</span>
            <Switch 
              checked={showOnlyMine} 
              onCheckedChange={setShowOnlyMine} 
            />
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center text-gray-500">
          {showOnlyMine 
            ? "Vous n'avez pas encore ajouté de commentaires" 
            : "Aucun commentaire pour le moment"}
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
      
      <div className="px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Afficher uniquement mes commentaires</span>
          <Switch 
            checked={showOnlyMine} 
            onCheckedChange={setShowOnlyMine} 
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {filteredFeedbacks.map((feedback) => (
          <Card 
            key={feedback.id} 
            className={`mb-4 ${feedback.done ? "bg-green-50" : ""}`}
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">{getCommenterName(feedback)}</p>
                <p className="text-xs text-gray-500">{formatDate(feedback.created_at)}</p>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 pt-0 pb-2">
              {feedback.timecode !== null && (
                <div className="flex items-center text-xs text-gray-500 mb-2">
                  <Video className="h-3 w-3 mr-1" />
                  <span>Timecode: {formatTimecode(feedback.timecode)}</span>
                </div>
              )}
              
              <p className="mb-2">{feedback.content}</p>
              
              {feedback.screenshot_url && (
                <div className="mt-2 mb-2">
                  <img 
                    src={feedback.screenshot_url} 
                    alt="Capture d'écran" 
                    className="max-h-32 rounded border"
                  />
                </div>
              )}
            </CardContent>
            
            <CardFooter className="p-4 pt-2 flex justify-between">
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => onEditFeedback(feedback)}
                  className="h-8 px-2"
                >
                  <Pen className="h-4 w-4 mr-1" />
                  <span></span>
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => onDeleteFeedback(feedback.id)}
                  className="h-8 px-2 text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  <span></span>
                </Button>
              </div>
              <Button
                size="sm"
                variant={feedback.done ? "outline" : "default"}
                onClick={() => onToggleStatus(feedback.id, feedback.done)}
                className={`h-8 ${feedback.done ? "text-gray-600" : ""}`}
              >
                {feedback.done ? "Rouvrir" : <Check className="h-4 w-4 mr-1" />}
                {!feedback.done && <span>Résolu</span>}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FeedbacksList;
