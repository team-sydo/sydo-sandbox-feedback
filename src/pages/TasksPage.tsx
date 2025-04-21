
import React, { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { Button } from "@/components/ui/button";
import { TaskModal } from "@/components/Tasks/TaskModal";
import { TaskList } from "@/components/Tasks/TaskList";
import { PlusCircle } from "lucide-react";

export default function TasksPage() {
  const [openModal, setOpenModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const { tasks, isLoading, refetch } = useTasks();

  const handleEdit = (task) => {
    setEditTask(task);
    setOpenModal(true);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-48">Chargement…</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mes Tâches</h1>
        <Button onClick={() => { setEditTask(null); setOpenModal(true); }}>
          <PlusCircle className="mr-2" /> Nouvelle tâche
        </Button>
      </div>
      <TaskList tasks={tasks} onEdit={handleEdit} refetch={refetch} />
      {openModal && (
        <TaskModal
          task={editTask}
          onClose={() => { setOpenModal(false); setEditTask(null); }}
          refetch={refetch}
        />
      )}
    </div>
  );
}
