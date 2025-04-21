
import React from "react";
import { TaskRow } from "./TaskRow";

function buildHierarchy(tasks, parent = null) {
  return tasks
    .filter((t) => (parent ? t.parent_id === parent.id : !t.parent_id))
    .sort((a, b) => a.position - b.position)
    .map((task) => ({
      ...task,
      subtasks: buildHierarchy(tasks, task),
    }));
}

export function TaskList({ tasks, onEdit, refetch }) {
  const tree = buildHierarchy(tasks);

  return (
    <div>
      {tree.length === 0 ? (
        <div className="text-muted-foreground text-center py-16">
          Aucune tâche pour l'instant.
        </div>
      ) : (
        <ul className="space-y-2">
          {tree.map((task) => (
            <TaskRow 
              key={task.id} 
              task={task} 
              onEdit={onEdit} 
              refetch={refetch} 
              depth={0} 
            />
          ))}
        </ul>
      )}
    </div>
  );
}
