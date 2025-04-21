
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash, Edit, ChevronDown, ChevronRight, CircleCheck, CircleDashed } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export function TaskRow({ task, onEdit, refetch, depth }) {
  const [open, setOpen] = useState(true);
  const { user } = useAuth();

  const canDelete = user && task.user_id === user.id;

  const handleDelete = async () => {
    if (!window.confirm("Supprimer cette tâche ?")) return;
    await supabase.from("tasks").delete().eq("id", task.id);
    refetch();
  };

  return (
    <li className={cn("bg-card rounded p-3", depth && "ml-8")}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {task.subtasks?.length > 0 && (
            <button onClick={() => setOpen((v) => !v)}>
              {open ? <ChevronDown /> : <ChevronRight />}
            </button>
          )}
          <span
            className={cn(
              "font-semibold",
              task.status === "fait" && "line-through text-green-600"
            )}
          >
            {task.title}
          </span>
          <span className="text-xs text-muted-foreground px-2">
            {task.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(task)}
            title="Modifier"
          >
            <Edit />
          </Button>
          {canDelete && (
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              title="Supprimer"
            >
              <Trash />
            </Button>
          )}
        </div>
      </div>
      {open && task.subtasks?.length > 0 && (
        <ul className="pl-4">
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
