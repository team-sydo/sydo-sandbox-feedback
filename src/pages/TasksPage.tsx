
import React, { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { Button } from "@/components/ui/button";
import { TaskModal } from "@/components/Tasks/TaskModal";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { label: "À faire", value: "à faire" },
  { label: "En cours", value: "en cours" },
  { label: "Fait", value: "fait" },
  { label: "Archivée", value: "archivée" },
];

export default function TasksPage() {
  const [openModal, setOpenModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const { tasks, isLoading, refetch } = useTasks();
  const { user } = useAuth();

  // Pour la modification inline du statut :
  const handleStatusChange = async (taskId, status) => {
    // update direct du statut
    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.from("tasks").update({ status }).eq("id", taskId);
    refetch();
  };

  // Permet la suppression
  const handleDelete = async (taskId) => {
    if (!window.confirm("Supprimer cette tâche ?")) return;
    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.from("tasks").delete().eq("id", taskId);
    refetch();
  };

  // Catégorisation
  const createdByMe = user
    ? tasks.filter((t) => t.user_id === user.id)
    : [];
  const assignedToMe = user
    ? tasks.filter((t) =>
        Array.isArray(t.assigned_to) && t.assigned_to.includes(user.id)
      )
    : [];

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

        {/* Tâches créées par moi */}
        <section>
          <h2 className="text-lg font-semibold mb-2 mt-10 border-t border-gray-200 pt-6">
            Tâches créées par moi
          </h2>
          <div>
            {createdByMe.length === 0 ? (
              <div className="text-gray-400 text-sm">Aucune tâche</div>
            ) : (
              <ul className="divide-y">
                {createdByMe.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center px-4 py-4 justify-between bg-white hover:bg-gray-50 rounded-lg transition border border-gray-100 shadow-sm"
                  >
                    {/* Title + Priority */}
                    <div className="flex-1 pr-3">
                      <span
                        className={cn(
                          "font-medium text-lg",
                          task.status === "fait"
                            ? "line-through text-green-600"
                            : "text-gray-900"
                        )}
                      >
                        {task.title}
                      </span>
                      {task.priority === "urgent" && (
                        <span className="bg-orange-100 text-orange-600 font-bold rounded px-3 py-1 text-xs ml-4">
                          Urgente
                        </span>
                      )}
                    </div>
                    {/* Due date */}
                    <span className="text-sm text-gray-500 w-24">
                      {task.due_date
                        ? new Date(task.due_date).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                          })
                        : null}
                    </span>
                    {/* Status dropdown inline */}
                    <select
                      className="ml-4 bg-gray-100 border border-gray-200 text-sm rounded-md px-2 py-1"
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditTask(task);
                          setOpenModal(true);
                        }}
                        title="Modifier"
                      >
                        <Edit size={18} />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(task.id)}
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
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
              <ul className="divide-y">
                {assignedToMe.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center px-4 py-4 bg-white rounded-lg transition border border-gray-100 shadow-sm"
                  >
                    <div className="flex-1 pr-3">
                      <span
                        className={cn(
                          "font-medium text-lg",
                          task.status === "fait"
                            ? "line-through text-green-600"
                            : "text-gray-900"
                        )}
                      >
                        {task.title}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 w-24">
                      {task.due_date
                        ? new Date(task.due_date).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                          })
                        : null}
                    </span>
                    <select
                      className="ml-4 bg-gray-100 border border-gray-200 text-sm rounded-md px-2 py-1 "
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditTask(task);
                          setOpenModal(true);
                        }}
                        title="Modifier"
                      >
                        <Edit size={18} />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(task.id)}
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
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
          allTasks={tasks}
        />
      )}
    </div>
  );
}
