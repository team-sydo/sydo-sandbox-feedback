import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash, Edit, ChevronDown, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export function TaskRowHome({ task, onEdit, refetch, depth }) {
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
  const assignedNames =
    task.assignedUsers && task.assignedUsers.length > 0
      ? task.assignedUsers.map((user) => user.prenom).join(", ")
      : null;

  // Info sur le créateur
  const creatorName = task.creator ? task.creator.prenom : "Inconnu";
  const isTaskCreator = user && task.user_id === user.id;

  return (
    <li
      className={cn(
        "bg-card rounded-lg p-3 mb-2 border border-gray-200 shadow-sm",
        depth > 0 && "ml-8 border-l-2 border-gray-200"
      )}
    >
      <div className="items-start justify-between">
        <div className="flex justify-between">
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
         {/* bouton et info subtasks */}
         <div className="m-1 flex items-center gap-1">
          {open ? <span></span> : <span> + {task.subtasks.length}</span>}
          {task.subtasks?.length > 0 && (
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </button>
          )}
        </div>

        </div>
        {/* titre et descro */}
        <div className="flex items-center gap-2 flex-1">
          <div>
            <span
              className={cn(
                "block text-sm",
                task.status === "fait" && "line-through text-green-600"
              )}
            >
              {task.title}
            </span>
            {/* <p className="text-xs">{task.description} </p> */}
          </div>
        </div>
       

        {/* Actions */}
        {/* <div className="">
          <div className="flex items-center gap-2">
           

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
        </div> */}
      </div>
      <div className="flex items-center w-full justify-between">
        {/* Afficher les priorités et dates */}
        <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
          {task.priority === "urgent" && (
            <span className=" text-orange-600 p-0.5 font-medium text-xs">
              Urgent
            </span>
          )}

          {task.due_date && (
            <span className="text-blue-600 p-0.5 font-medium text-xs">
              {new Date(task.due_date).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "short",
              })}
            </span>
          )}
        </div>
        {/* Afficher les infos sur qui est assigné ou qui a créé */}
        <div className="">
          {isTaskCreator && assignedNames && (
            <span className=" text-purple-600 px-0.5 py-0.5 text-xs">
              Partagée avec : {assignedNames}
            </span>
          )}
          {!isTaskCreator && (
            <span className=" text-purple-600 px-à.5 py-0.5 text-xs">
              Créé par: {creatorName}
            </span>
          )}
        </div>
      </div>

      {open && task.subtasks?.length > 0 && (
        <ul className="mt-2">
          {task.subtasks.map((subtask) => (
            <TaskRowHome
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
