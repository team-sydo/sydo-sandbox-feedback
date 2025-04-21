
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

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

// Form type
type TaskFormValues = {
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: Date | null;
  remind_at: Date | null;
  assigned_to: string;
  parent_id: string;
  time: string; // for separate "hh:mm" reminder
};

export function TaskModal({ task, onClose, refetch }) {
  const { user } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<TaskFormValues>({
    defaultValues: {
      title: "",
      description: "",
      status: "à faire",
      priority: "low",
      due_date: null,
      remind_at: null,
      assigned_to: "",
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
      setValue("assigned_to", Array.isArray(task.assigned_to) ? task.assigned_to.join(", ") : "");
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

  // Pour la sélection de la date + heure du rappel
  function combineRemindDateTime(date: Date | null, time: string) {
    if (!date || !time) return null;
    // Combine YYYY-MM-DD + hh:mm
    const [hour, minute] = time.split(":");
    const newDate = new Date(date);
    newDate.setHours(Number(hour), Number(minute), 0, 0);
    return newDate;
  }

  // Correction uuid "" -> null
  function cleanUUID(str: string) {
    return str && str.trim().length > 0 ? str.trim() : null;
  }

  const onSubmit = async (form: TaskFormValues) => {
    try {
      const input = {
        ...form,
        due_date: form.due_date ? form.due_date.toISOString() : null,
        remind_at: combineRemindDateTime(form.remind_at, form.time)?.toISOString() ?? null,
        assigned_to:
          form.assigned_to && form.assigned_to.trim().length > 0
            ? form.assigned_to.split(",").map((s) => s.trim())
            : [],
        user_id: user.id,
        parent_id: cleanUUID(form.parent_id),
        project_id: task?.project_id || "00000000-0000-0000-0000-000000000000",
      };

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
    } catch (error: any) {
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
            <h2 className="font-semibold text-2xl mb-6">Créer une nouvelle tâche</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 items-start">
              {/* Titre */}
              <div className="col-span-2">
                <label htmlFor="title" className="text-sm font-medium text-gray-700 block mb-1">
                  Titre de la tâche
                </label>
                <Input id="title" {...register("title", { required: true })} autoFocus />
                {errors.title && (
                  <div className="text-sm text-red-500 mt-1">Le titre est requis</div>
                )}
              </div>

              {/* Description */}
              <div className="col-span-2">
                <label htmlFor="description" className="text-sm font-medium text-gray-700 block mb-1">
                  Description
                </label>
                <Textarea id="description" {...register("description")} rows={2} />
              </div>

              {/* Statut */}
              <div>
                <label htmlFor="status" className="text-sm font-medium text-gray-700 block mb-1">
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

              {/* Assignes */}
              <div>
                <label htmlFor="assigned_to" className="text-sm font-medium text-gray-700 block mb-1">
                  Assignés
                </label>
                <Input
                  id="assigned_to"
                  {...register("assigned_to")}
                  placeholder="uuid1, uuid2"
                />
              </div>

              {/* Date limite */}
              <div>
                <label htmlFor="due_date" className="text-sm font-medium text-gray-700 block mb-1">
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
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={(d) => setValue("due_date", d as Date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Parent Id / sous-tâche */}
              <div>
                <label htmlFor="parent_id" className="text-sm font-medium text-gray-700 block mb-1">
                  Sous-tâche de
                </label>
                <Input id="parent_id" {...register("parent_id")} placeholder="UUID parent" />
              </div>

              {/* Rappel */}
              <div>
                <label htmlFor="remind_at" className="text-sm font-medium text-gray-700 block mb-1">
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
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={remindDate}
                      onSelect={(d) => setValue("remind_at", d as Date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Heure du rappel */}
              <div>
                <label htmlFor="time" className="text-sm font-medium text-gray-700 block mb-1">
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
