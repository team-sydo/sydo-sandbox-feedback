
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash, Edit, ChevronDown, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export function TaskRow({ task, onEdit, refetch, depth }) {
  const [open, setOpen] = useState(true);
  const { user } = useAuth();

  const canDelete = user && task.user_id === user.id;
  
  const statusOptions = [
    { label: "À faire", value: "à faire" },
    { label: "En cours", value: "en cours" },
    { label: "Fait", value: "fait" },
    { label: "Archivée", value: "archivée" },
  ];

  const handleDelete = async () => {
    if (!window.confirm("Supprimer cette tâche ?")) return;
    await supabase.from("tasks").delete().eq("id", task.id);
    refetch();
  };

  const handleStatusChange = async (e) => {
    await supabase
      .from("tasks")
      .update({ status: e.target.value })
      .eq("id", task.id);
    refetch();
  };

  // Format des assignations pour l'affichage
  const assignedNames = task.assignedUsers && task.assignedUsers.length > 0
    ? task.assignedUsers.map(user => user.prenom).join(", ")
    : null;

  // Info sur le créateur
  const creatorName = task.creator ? task.creator.prenom : "Inconnu";
  const isTaskCreator = user && task.user_id === user.id;
  
  return (
    <li className={cn("bg-card rounded-lg p-4 mb-2", depth > 0 && "ml-8 border-l-2 border-gray-200")}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          {task.subtasks?.length > 0 && (
            <button 
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </button>
          )}
          <div className="flex-1">
            <span
              className={cn(
                "font-semibold block",
                task.status === "fait" && "line-through text-green-600"
              )}
            >
              {task.title}
            </span>
            
            <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
              {task.priority === "urgent" && (
                <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                  Urgent
                </span>
              )}
              
              {task.due_date && (
                <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                  {new Date(task.due_date).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
              )}
              
              {/* Afficher les infos sur qui est assigné ou qui a créé */}
              {isTaskCreator && assignedNames && (
                <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
                  Assigné à: {assignedNames}
                </span>
              )}
              
              {!isTaskCreator && (
                <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                  Créé par: {creatorName}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            className="text-sm bg-gray-100 border border-gray-200 rounded-md px-2 py-1 text-gray-800"
            value={task.status}
            onChange={handleStatusChange}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(task)}
            className="p-1 h-auto"
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          {canDelete && (
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              className="p-1 h-auto"
              title="Supprimer"
            >
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {open && task.subtasks?.length > 0 && (
        <ul className="mt-2">
          {task.subtasks.map((subtask) => (
            <TaskRow
              key={subtask.id}
              task={subtask}
              onEdit={onEdit}
              refetch={refetch}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
