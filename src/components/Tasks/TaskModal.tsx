
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { label: "À faire", value: "à faire" },
  { label: "En cours", value: "en cours" },
  { label: "Fait", value: "fait" },
  { label: "Archivée", value: "archivée" },
];
const PRIORITY_OPTIONS = [
  { label: "Basse", value: "low" },
  { label: "Moyenne", value: "medium" },
  { label: "Haute", value: "high" },
  { label: "Urgente", value: "urgent" },
];

export function TaskModal({ task, onClose, refetch, allTasks }) {
  const { user } = useAuth();
  const { toast } = useToast();

  // Pour dropdown utilisateurs (Assignés)
  const [users, setUsers] = useState([]);
  useEffect(() => {
    // Va chercher les utilisateurs existants pour le dropdown "Assignés"
    const fetchUsers = async () => {
      // only fetch if modal open
      let { data, error } = await supabase.from("users").select("*");
      if (!error) setUsers(data);
    };
    fetchUsers();
  }, []);

  // Pour dropdown tâches existantes
  const taskOptions = useMemo(
    () =>
      (allTasks || [])
        .filter((t) => !task || t.id !== task.id)
        .map((t) => ({
          value: t.id,
          label: t.title,
        })),
    [allTasks, task]
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      status: "à faire",
      priority: "low",
      due_date: null,
      remind_at: null,
      assigned_to: [],
      parent_id: "",
      time: "",
    },
  });

  // Remplir sur édition
  useEffect(() => {
    if (task) {
      setValue("title", task.title || "");
      setValue("description", task.description || "");
      setValue("status", task.status || "à faire");
      setValue("priority", task.priority || "low");
      setValue("assigned_to", Array.isArray(task.assigned_to) ? task.assigned_to : []);
      setValue("parent_id", task.parent_id || "");
      setValue("due_date", task.due_date ? new Date(task.due_date) : null);
      setValue("remind_at", task.remind_at ? new Date(task.remind_at) : null);
      setValue("time", task.remind_at ? format(new Date(task.remind_at), "HH:mm") : "");
    } else {
      reset();
    }
  }, [task, setValue, reset]);

  const dueDate = watch("due_date");
  const remindDate = watch("remind_at");
  const remindTime = watch("time");
  const assignedTo = watch("assigned_to");
  const priority = watch("priority");
  const status = watch("status");
  const parentId = watch("parent_id");

  function combineRemindDateTime(date, time) {
    if (!date || !time) return null;
    const [hour, minute] = time.split(":");
    const newDate = new Date(date);
    newDate.setHours(Number(hour), Number(minute), 0, 0);
    return newDate;
  }

  // Correction uuid "" -> null
  function cleanUUID(str) {
    return str && str.trim().length > 0 ? str.trim() : null;
  }

  // --- Dropdown customisers ---

  function ToggleDropdown({ children, open, setOpen }) {
    return (
      <button
        type="button"
        className={cn(
          "w-full flex items-center justify-between border border-gray-200 bg-white rounded px-3 py-2 text-base",
          open && "ring-2 ring-primary"
        )}
        onClick={() => setOpen((b) => !b)}
      >
        <span>{children}</span>
        <ChevronDown className="ml-2 w-4 h-4 opacity-60" />
      </button>
    );
  }

  function PriorityDropdown() {
    const [open, setOpen] = useState(false);

    return (
      <div className="relative">
        <ToggleDropdown open={open} setOpen={setOpen}>
          {
            PRIORITY_OPTIONS.find((opt) => opt.value === priority)?.label ||
            "Choisir"
          }
        </ToggleDropdown>
        {open && (
          <div className="absolute mt-1 left-0 z-40 w-full bg-white border border-gray-200 shadow-xl rounded py-2">
            {PRIORITY_OPTIONS.map((opt) => (
              <button
                type="button"
                className={cn(
                  "flex w-full items-center px-3 py-2 text-base hover:bg-blue-50",
                  priority === opt.value && "bg-blue-100"
                )}
                key={opt.value}
                onClick={() => {
                  setValue("priority", opt.value);
                  setOpen(false);
                }}
              >
                {priority === opt.value && <Check className="mr-2 w-4 h-4 text-blue-500" />}
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  function UsersDropdown() {
    const [open, setOpen] = useState(false);

    return (
      <div className="relative">
        <ToggleDropdown open={open} setOpen={setOpen}>
          {assignedTo.length
            ? assignedTo
                .map(
                  (uid) =>
                    users.find((u) => u.id === uid)?.prenom ||
                    users.find((u) => u.id === uid)?.nom ||
                    "?"
                )
                .join(", ")
            : "Aucun"}
        </ToggleDropdown>
        {open && (
          <ScrollArea className="absolute mt-1 left-0 z-40 w-full max-h-56 bg-white border border-gray-200 shadow-xl rounded py-2">
            {users.map((u) => (
              <button
                type="button"
                className={cn(
                  "flex w-full items-center px-3 py-2 text-base hover:bg-blue-50",
                  assignedTo.includes(u.id) && "bg-blue-100"
                )}
                key={u.id}
                onClick={() => {
                  // toggle selection (multi)
                  if (assignedTo.includes(u.id)) {
                    setValue(
                      "assigned_to",
                      assignedTo.filter((x) => x !== u.id)
                    );
                  } else {
                    setValue("assigned_to", [...assignedTo, u.id]);
                  }
                }}
              >
                {assignedTo.includes(u.id) && (
                  <Check className="mr-2 w-4 h-4 text-blue-500" />
                )}
                {u.prenom} {u.nom}
              </button>
            ))}
          </ScrollArea>
        )}
      </div>
    );
  }

  function TasksDropdown() {
    const [open, setOpen] = useState(false);

    return (
      <div className="relative">
        <ToggleDropdown open={open} setOpen={setOpen}>
          {parentId
            ? taskOptions.find((t) => t.value === parentId)?.label || "Choisir"
            : "Aucune"}
        </ToggleDropdown>
        {open && (
          <div className="absolute mt-1 left-0 z-40 w-full bg-white border border-gray-200 shadow-xl rounded py-2">
            <button
              type="button"
              className={cn(
                "flex w-full items-center px-3 py-2",
                !parentId && "bg-blue-100"
              )}
              onClick={() => {
                setValue("parent_id", "");
                setOpen(false);
              }}
            >
              Sans sous-tâche
            </button>
            {taskOptions.map((opt) => (
              <button
                type="button"
                className={cn(
                  "flex w-full items-center px-3 py-2",
                  parentId === opt.value && "bg-blue-100"
                )}
                key={opt.value}
                onClick={() => {
                  setValue("parent_id", opt.value);
                  setOpen(false);
                }}
              >
                {parentId === opt.value && (
                  <Check className="mr-2 w-4 h-4 text-blue-500" />
                )}
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const onSubmit = async (form) => {
    try {
      const input = {
        ...form,
        due_date: form.due_date ? form.due_date.toISOString() : null,
        remind_at: combineRemindDateTime(form.remind_at, form.time)?.toISOString() ?? null,
        assigned_to: form.assigned_to,
        user_id: user.id,
        parent_id: cleanUUID(form.parent_id),
        project_id: task?.project_id || "00000000-0000-0000-0000-000000000000",
      };

      // Correction bug uuid empty string
      if (!input.parent_id) input.parent_id = null;

      if (task?.id) {
        const { error } = await supabase.from("tasks").update(input).eq("id", task.id);
        if (error) throw error;
        toast({
          title: "Tâche mise à jour",
          description: "La tâche a été modifiée avec succès",
        });
      } else {
        const { error } = await supabase.from("tasks").insert(input);
        if (error) throw error;
        toast({
          title: "Tâche créée",
          description: "La nouvelle tâche a été créée avec succès",
        });
      }
      refetch();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la création/modification de la tâche:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 bg-white rounded-2xl shadow-lg border-0">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-8">
            <h2 className="font-semibold text-2xl mb-6">
              {task?.id ? "Modifier la tâche" : "Créer une nouvelle tâche"}
            </h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 items-start">
              {/* Titre */}
              <div className="col-span-2">
                <label
                  htmlFor="title"
                  className="text-sm font-medium text-gray-700 block mb-1"
                >
                  Titre de la tâche
                </label>
                <Input id="title" {...register("title", { required: true })} autoFocus />
                {errors.title && (
                  <div className="text-sm text-red-500 mt-1">Le titre est requis</div>
                )}
              </div>
              {/* Description */}
              <div className="col-span-2">
                <label
                  htmlFor="description"
                  className="text-sm font-medium text-gray-700 block mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  {...register("description")}
                  rows={2}
                  className="w-full rounded border border-gray-200 p-2"
                />
              </div>
              {/* Statut */}
              <div>
                <label
                  htmlFor="status"
                  className="text-sm font-medium text-gray-700 block mb-1"
                >
                  Statut
                </label>
                <select
                  id="status"
                  className="w-full border border-gray-200 rounded px-3 py-2 bg-white text-base"
                  {...register("status")}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              {/* Assignés (multi dropdown) */}
              <div>
                <label
                  htmlFor="assigned_to"
                  className="text-sm font-medium text-gray-700 block mb-1"
                >
                  Assignés
                </label>
                <UsersDropdown />
              </div>
              {/* Date limite */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Date limite
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={
                        "w-full flex justify-between items-center px-3 py-2 bg-white border border-gray-200"
                      }
                    >
                      {dueDate ? format(dueDate, "dd/MM/yyyy") : <span>Choisir une date</span>}
                      <CalendarIcon className="ml-2 h-4 w-4 text-gray-400" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={(d) => setValue("due_date", d)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {/* Sous-tâche de (dropdown) */}
              <div>
                <label
                  htmlFor="parent_id"
                  className="text-sm font-medium text-gray-700 block mb-1"
                >
                  Sous-tâche de
                </label>
                <TasksDropdown />
              </div>
              {/* Rappel */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Rappel à
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full flex justify-between items-center px-3 py-2 bg-white border border-gray-200"
                    >
                      {remindDate
                        ? format(remindDate, "dd/MM/yyyy")
                        : <span>Choisir date</span>}
                      <CalendarIcon className="ml-2 h-4 w-4 text-gray-400" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50" align="start">
                    <Calendar
                      mode="single"
                      selected={remindDate}
                      onSelect={(d) => setValue("remind_at", d)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {/* Heure du rappel */}
              <div>
                <label
                  htmlFor="time"
                  className="text-sm font-medium text-gray-700 block mb-1"
                >
                  Heure
                </label>
                <Input
                  id="time"
                  type="time"
                  {...register("time")}
                  placeholder="hh:mm"
                  className="bg-white border border-gray-200"
                />
              </div>
              {/* Priorité (dropdown custom) */}
              <div>
                <label
                  htmlFor="priority"
                  className="text-sm font-medium text-gray-700 block mb-1"
                >
                  Priorité
                </label>
                <PriorityDropdown />
              </div>
            </div>
            {/* Boutons */}
            <div className="flex justify-end gap-2 mt-8">
              <Button type="button" variant="ghost" className="rounded-md px-6" onClick={onClose}>
                Annuler
              </Button>
              <Button
                type="submit"
                className="bg-[#1EAEDB] hover:bg-[#0FA0CE] text-white font-semibold rounded-md px-6"
                disabled={isSubmitting}
              >
                {task?.id ? "Enregistrer" : "Créer"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
