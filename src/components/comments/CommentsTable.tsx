
import { Check, Image } from "lucide-react";
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

interface CommentsTableProps {
  feedbacks: Feedback[];
  toggleFeedbackStatus: (id: string, currentStatus: boolean) => Promise<void>;
  formatTimecode: (seconds: number | null) => string;
}

export function CommentsTable({ 
  feedbacks, 
  toggleFeedbackStatus,
  formatTimecode
}: CommentsTableProps) {
  const getCommenterName = (feedback: Feedback) => {
    if (feedback.user && feedback.user.prenom && feedback.user.nom) {
      return `${feedback.user.prenom} ${feedback.user.nom} (User)`;
    } else if (feedback.guest && feedback.guest.prenom && feedback.guest.nom) {
      return `${feedback.guest.prenom} ${feedback.guest.nom} (Guest)`;
    }
    return "Anonyme";
  };

  const getGrainTitle = (feedback: Feedback) => {
    return feedback.grain?.title || "Inconnu";
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Nom du commentateur</TableHead>
            <TableHead>Grain</TableHead>
            <TableHead>Commentaire</TableHead>
            <TableHead>Capture</TableHead>
            <TableHead>Time Code</TableHead>
            <TableHead>Traité</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {feedbacks.map((feedback, index) => (
            <TableRow key={feedback.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{getCommenterName(feedback)}</TableCell>
              <TableCell>{getGrainTitle(feedback)}</TableCell>
              <TableCell>{feedback.content}</TableCell>
              <TableCell>
                {feedback.screenshot_url ? (
                  <a
                    href={feedback.screenshot_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-500 hover:underline"
                  >
                    <img
                      src={feedback.screenshot_url}
                      alt="Capture"
                      className="max-w-24 max-h-24"
                    />
                  </a>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
