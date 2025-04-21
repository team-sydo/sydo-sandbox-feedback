
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const STATUS_OPTIONS = ["à faire", "en cours", "fait", "archivée"];
const PRIORITY_OPTIONS = ["low", "medium", "high", "urgent"];

export function TaskModal({ task, onClose, refetch }) {
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      status: "à faire",
      priority: "low",
      due_date: "",
      position: 0,
      remind_at: "",
    },
  });

  useEffect(() => {
    if (task) {
      Object.keys(task).forEach((k) => setValue(k, task[k]));
    } else {
      reset();
    }
  }, [task, setValue, reset]);

  const onSubmit = async (form) => {
    const input = {
      ...form,
      due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
      remind_at: form.remind_at ? new Date(form.remind_at).toISOString() : null,
      assigned_to: form.assigned_to ? form.assigned_to.split(",").map((s) => s.trim()) : [],
      user_id: user.id,
      project_id: task?.project_id || "", // à adapter selon vos besoins projets
      parent_id: task?.parent_id || null,
    };

    if (task?.id) {
      await supabase.from("tasks").update(input).eq("id", task.id);
    } else {
      await supabase.from("tasks").insert(input);
    }
    refetch();
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task?.id ? "Modifier la tâche" : "Nouvelle tâche"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Input label="Titre" {...register("title", { required: true })} placeholder="Ex: Faire la doc..." />
          <Textarea label="Description" {...register("description")} />

          <div className="flex gap-2">
            <select {...register("status")} className="w-1/2 border rounded px-2 py-1">
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select {...register("priority")} className="w-1/2 border rounded px-2 py-1">
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <Input type="date" label="À faire pour le" {...register("due_date")} />
          <Input type="datetime-local" label="Rappel le" {...register("remind_at")} />
          <Input label="Assigné à (user_id séparés par des virgules)" {...register("assigned_to")} placeholder="uuid1, uuid2" />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
            <Button type="submit" disabled={isSubmitting}>
              {task?.id ? "Enregistrer" : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
