
import React, { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { Button } from "@/components/ui/button";
import { TaskModal } from "@/components/Tasks/TaskModal";
import { TaskList } from "@/components/Tasks/TaskList";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STATUS_OPTIONS = [
  { label: "À faire", value: "à faire" },
  { label: "En cours", value: "en cours" },
  { label: "Fait", value: "fait" },
  { label: "Archivée", value: "archivée" },
];

const FILTER_OPTIONS = [
  { label: "Toutes", value: "all" },
  { label: "À faire", value: "à faire" },
  { label: "En cours", value: "en cours" },
  { label: "Urgentes", value: "urgent" },
];

export default function TasksPage() {
  const [openModal, setOpenModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filter, setFilter] = useState("all");
  const { tasks, isLoading, refetch } = useTasks();
  const { user } = useAuth();

  const handleEdit = (task) => {
    setEditTask(task);
    setOpenModal(true);
  };

  // Récupérer les tâches selon les différentes catégories
  const createdByMe = user ? tasks.filter(t => t.user_id === user.id) : [];
  const assignedToMe = user ? tasks.filter(t => 
    Array.isArray(t.assigned_to) && t.assigned_to.includes(user.id) && t.user_id !== user.id
  ) : [];

  // Filtrer selon l'onglet sélectionné
  const filterTasks = (taskList) => {
    if (filter === "all") return taskList;
    if (filter === "urgent") return taskList.filter(t => t.priority === "urgent");
    return taskList.filter(t => t.status === filter);
  };

  const filteredCreatedTasks = filterTasks(createdByMe);
  const filteredAssignedTasks = filterTasks(assignedToMe);

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

        <Tabs defaultValue="created" className="w-full">
          <TabsList className="w-full mb-8 bg-white">
            <TabsTrigger value="created" className="flex-1">Tâches créées</TabsTrigger>
            <TabsTrigger value="assigned" className="flex-1">Tâches assignées</TabsTrigger>
          </TabsList>
          
          {/* Filtres */}
          <div className="flex mb-4">
            {FILTER_OPTIONS.map(option => (
              <Button 
                key={option.value}
                variant={filter === option.value ? "default" : "outline"}
                className="mr-2"
                onClick={() => setFilter(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          <TabsContent value="created">
            <Card>
              <CardHeader>
                <CardTitle>Tâches créées par moi</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredCreatedTasks.length === 0 ? (
                  <div className="text-gray-400 text-center py-8">Aucune tâche ne correspond à ce filtre</div>
                ) : (
                  <TaskList 
                    tasks={filteredCreatedTasks} 
                    onEdit={handleEdit} 
                    refetch={refetch} 
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="assigned">
            <Card>
              <CardHeader>
                <CardTitle>Tâches qui me sont assignées</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredAssignedTasks.length === 0 ? (
                  <div className="text-gray-400 text-center py-8">Aucune tâche ne correspond à ce filtre</div>
                ) : (
                  <TaskList 
                    tasks={filteredAssignedTasks} 
                    onEdit={handleEdit} 
                    refetch={refetch} 
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
