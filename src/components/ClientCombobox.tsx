import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Client {
  id: string;
  nom: string;
}

export interface ClientSelection {
  type: "existing" | "new";
  value: string;
  label: string;
}

interface ClientComboboxProps {
  value: ClientSelection | null;
  onChange: (value: ClientSelection | null) => void;
  placeholder?: string;
  emptyMessage?: string;
}

export function ClientCombobox({
  value,
  onChange,
  placeholder = "Sélectionner un client",
  emptyMessage = "Aucun client trouvé",
}: ClientComboboxProps) {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newClientName, setNewClientName] = useState("");

  // Charger la liste des clients depuis Supabase
  useEffect(() => {
    const fetchClients = async () => {
      if (!user) return;

      try {
        setIsLoading(true);

        const { data, error } = await supabase
          .from("clients")
          .select("id, nom")
          .eq("user_id", user.id)
          .order("nom");

        if (error) throw error;
        setClients(data || []);
      } catch (error) {
        console.error("Error loading clients:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClients();
  }, [user]);

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === "new") {
      onChange({
        type: "new",
        value: "",
        label: "Nouveau client",
      });
      setNewClientName("");
    } else {
      const selectedClient = clients.find(
        (client) => client.id === selectedValue
      );
      if (selectedClient) {
        onChange({
          type: "existing",
          value: selectedClient.id,
          label: selectedClient.nom,
        });
      }
    }
  };

  const handleNewClientNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewClientName(e.target.value);
    onChange({
      type: "new",
      value: e.target.value,
      label: e.target.value,
    });
  };

  return (
    <div className="space-y-2">
      <Select
        value={
          value?.type === "existing"
            ? value.value
            : value?.type === "new"
            ? "new"
            : ""
        }
        onValueChange={handleSelectChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <div className="py-2 px-2 text-sm">Chargement...</div>
          ) : clients.length === 0 ? (
            <div className="py-2 px-2 text-sm">{emptyMessage}</div>
          ) : (
            <>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.nom}
                </SelectItem>
              ))}
              <SelectItem value="new" className="font-medium text-primary">
                + Ajouter nouveau
              </SelectItem>
            </>
          )}
        </SelectContent>
      </Select>

      {value?.type === "new" && (
        <div className="pt-2">
          <Label htmlFor="new-client-name">Nom du nouveau client</Label>
          <Input
            id="new-client-name"
            value={newClientName}
            onChange={handleNewClientNameChange}
            placeholder="Entrez le nom du client"
            className="mt-1"
          />
        </div>
      )}
    </div>
  );
}
