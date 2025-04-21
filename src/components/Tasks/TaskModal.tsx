
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const STATUS_OPTIONS = ["à faire", "en cours", "fait", "archivée"];
const PRIORITY_OPTIONS = ["low", "medium", "high", "urgent"];

// Définir le type pour les valeurs de formulaire
type TaskFormValues = {
  title: string;
  description: string;
  status: "à faire" | "en cours" | "fait" | "archivée";
  priority: "low" | "medium" | "high" | "urgent";
  due_date: string;
  position: number;
  remind_at: string;
  assigned_to: string;
};

export function TaskModal({ task, onClose, refetch }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<TaskFormValues>({
    defaultValues: {
      title: "",
      description: "",
      status: "à faire",
      priority: "low",
      due_date: "",
      position: 0,
      remind_at: "",
      assigned_to: "",
    },
  });

  useEffect(() => {
    if (task) {
      // Pour les champs normaux
      ["title", "description", "status", "priority", "position"].forEach((k) => {
        if (task[k] !== undefined) setValue(k as keyof TaskFormValues, task[k]);
      });
      
      // Gérer les dates spécifiquement pour formater correctement
      if (task.due_date) {
        setValue("due_date", task.due_date.split('T')[0]); // Format YYYY-MM-DD pour input type date
      }
      
      if (task.remind_at) {
        // Format YYYY-MM-DDThh:mm pour input type datetime-local
        const dateTime = new Date(task.remind_at);
        const formattedDateTime = dateTime.toISOString().substring(0, 16);
        setValue("remind_at", formattedDateTime);
      }
      
      // Gérer séparément assigned_to car c'est un tableau dans la DB
      if (task.assigned_to && Array.isArray(task.assigned_to)) {
        setValue("assigned_to", task.assigned_to.join(", "));
      }
    } else {
      reset();
    }
  }, [task, setValue, reset]);

  const onSubmit = async (form: TaskFormValues) => {
    try {
      // Calculer un project_id par défaut si absent
      // Dans un cas réel, il faudrait probablement le récupérer du contexte ou d'un paramètre
      const project_id = task?.project_id || "00000000-0000-0000-0000-000000000000"; // UUID par défaut pour test
      
      const input = {
        ...form,
        due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
        remind_at: form.remind_at ? new Date(form.remind_at).toISOString() : null,
        assigned_to: form.assigned_to ? form.assigned_to.split(",").map((s) => s.trim()) : [],
        user_id: user.id,
        project_id: project_id,
        parent_id: task?.parent_id || null,
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task?.id ? "Modifier la tâche" : "Nouvelle tâche"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input 
              id="title"
              placeholder="Ex: Faire la doc..." 
              {...register("title", { required: true })} 
            />
            {errors.title && <p className="text-sm text-red-500">Le titre est requis</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description"
              {...register("description")} 
            />
          </div>

          <div className="flex gap-2">
            <div className="w-1/2 space-y-2">
              <Label htmlFor="status">Statut</Label>
              <select 
                id="status"
                {...register("status")} 
                className="w-full border rounded px-2 py-1"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="w-1/2 space-y-2">
              <Label htmlFor="priority">Priorité</Label>
              <select 
                id="priority"
                {...register("priority")} 
                className="w-full border rounded px-2 py-1"
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="due_date">À faire pour le</Label>
            <Input type="date" id="due_date" {...register("due_date")} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="remind_at">Rappel le</Label>
            <Input type="datetime-local" id="remind_at" {...register("remind_at")} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="assigned_to">Assigné à (user_id séparés par des virgules)</Label>
            <Input 
              id="assigned_to"
              placeholder="uuid1, uuid2" 
              {...register("assigned_to")} 
            />
          </div>

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
