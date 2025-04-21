
import React, { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { Button } from "@/components/ui/button";
import { TaskModal } from "@/components/Tasks/TaskModal";
import { Plus } from "lucide-react";

export default function TasksPage() {
  const [openModal, setOpenModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const { tasks, isLoading, refetch } = useTasks();

  // Séparer les tâches créées par moi et celles où je suis assigné
  const me = tasks.filter(
    (t) => t.user_id && editTask?.user && t.user_id === editTask?.user.id
  ); // fallback, mais on ne dispose pas du user ici, donc ignore

  // Catégorisation
  const createdByMe = tasks.filter(
    (t) => t.user_id && t.user_id === (editTask?.user?.id || t.user_id)
  );
  const assignedToMe = tasks.filter(
    (t) => Array.isArray(t.assigned_to) && t.assigned_to.includes(editTask?.user?.id)
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">Chargement…</div>
    );
  }

  return (
    <div className="bg-[#F6F6F7] min-h-screen">
      <div className="max-w-4xl mx-auto py-10 px-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Mes Tâches</h1>
          <Button
            className="bg-[#1EAEDB] hover:bg-[#0FA0CE] transition text-white font-medium rounded-md px-5 py-2 text-base"
            onClick={() => {
              setEditTask(null);
              setOpenModal(true);
            }}
          >
            <Plus className="mr-2" /> Nouvelle Tâche
          </Button>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 mb-4">
          <Button
            variant="outline"
            className="text-gray-700 bg-white border border-gray-200 shadow-none rounded-md px-5"
          >
            Filtre rapide
          </Button>
          <Button
            variant="outline"
            className="text-gray-700 bg-white border border-gray-200 shadow-none rounded-md px-5"
          >
            Tri par
          </Button>
        </div>

        {/* Tâches créées par moi */}
        <section>
          <h2 className="text-lg font-semibold mb-2 mt-10 border-t border-gray-200 pt-6">
            Tâches créées par moi
          </h2>
          {/* À remplacer par TaskList en colonne simple */}
          <div>
            {createdByMe.length === 0 ? (
              <div className="text-gray-400 text-sm">Aucune tâche</div>
            ) : (
              <ul className="space-y-3">
                {createdByMe.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center bg-white rounded-lg px-4 py-3 justify-between border border-gray-100 shadow-sm"
                  >
                    <span className={`flex-1 font-medium text-lg ${task.status === "fait" ? "line-through text-green-700" : "text-gray-900"}`}>
                      {task.title}
                    </span>
                    {task.priority === "urgent" && (
                      <span className="bg-orange-100 text-orange-600 font-bold rounded px-3 py-1 text-xs ml-4">
                        Urgente
                      </span>
                    )}
                    <span className="ml-4 text-sm text-gray-500">
                      {/* Supposons "20 avr" comme date exemple */}
                      {task.due_date ? new Date(task.due_date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : null}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Tâches où je suis assigné */}
        <section>
          <h2 className="text-lg font-semibold mb-2 mt-10 border-t border-gray-200 pt-6">
            Tâches où je suis assigné
          </h2>
          <div>
            {assignedToMe.length === 0 ? (
              <div className="text-gray-400 text-sm">Aucune tâche</div>
            ) : (
              <ul className="space-y-3">
                {assignedToMe.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center bg-white rounded-lg px-4 py-3 border border-gray-100 shadow-sm"
                  >
                    <span className={`flex-1 font-medium text-lg ${task.status === "fait" ? "line-through text-green-700" : "text-gray-900"}`}>
                      {task.title}
                    </span>
                    <span className="ml-4 text-sm text-gray-500">
                      {task.due_date ? new Date(task.due_date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : null}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
      {openModal && (
        <TaskModal
          task={editTask}
          onClose={() => {
            setOpenModal(false);
            setEditTask(null);
          }}
          refetch={refetch}
        />
      )}
    </div>
  );
}
