
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const resourceTypes = ["MM", "Figma", "budget", "Contenu texte", "Photoshop", "XD", "Autre"] as const;

interface ResourceFormProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onResourceAdded: () => void;
}

interface FormData {
  title: string;
  type: typeof resourceTypes[number];
  url: string;
}

export function ResourceForm({ projectId, isOpen, onClose, onResourceAdded }: ResourceFormProps) {
  const { toast } = useToast();
  const form = useForm<FormData>({
    defaultValues: {
      title: "",
      type: "Autre",
      url: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const { error } = await supabase.from("ressources").insert({
        title: data.title,
        type: data.type,
        url: data.url,
        project_id: projectId,
      });

      if (error) throw error;

      toast({
        title: "Ressource ajoutée",
        description: "La ressource a été ajoutée avec succès",
      });

      form.reset();
      onResourceAdded();
      onClose();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter une ressource</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Titre de la ressource" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {resourceTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input {...field} type="url" placeholder="https://" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit">
                Ajouter
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
