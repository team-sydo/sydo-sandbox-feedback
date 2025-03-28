
import { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";

interface Client {
  id: string;
  nom: string;
}

interface ClientComboboxProps {
  onClientSelect: (clientId: string | null, clientName: string) => void;
  defaultValue?: string;
}

export function ClientCombobox({ onClientSelect, defaultValue }: ClientComboboxProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue || "");
  const [inputValue, setInputValue] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("clients")
          .select("id, nom")
          .order("nom");

        if (error) {
          throw error;
        }

        setClients(data || []);
        setFilteredClients(data || []);
      } catch (error) {
        console.error("Erreur lors du chargement des clients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Update filtered clients when input changes
  useEffect(() => {
    if (clients && clients.length > 0) {
      if (!inputValue) {
        setFilteredClients(clients);
      } else {
        const filtered = clients.filter(client => 
          client.nom.toLowerCase().includes(inputValue.toLowerCase())
        );
        setFilteredClients(filtered);
      }
    }
  }, [inputValue, clients]);

  const handleSelect = (currentValue: string) => {
    // Si la valeur sélectionnée est un ID existant
    const selectedClient = clients.find(client => client.id === currentValue);
    
    if (selectedClient) {
      setValue(currentValue);
      setInputValue(selectedClient.nom);
      onClientSelect(selectedClient.id, selectedClient.nom);
    } else {
      // Cas où l'utilisateur a entré un nouveau nom de client
      setValue("");
      setInputValue(currentValue);
      onClientSelect(null, currentValue);
    }
    
    setOpen(false);
  };

  // Ensure we have a default input value when a default client is selected
  useEffect(() => {
    if (defaultValue && clients.length > 0) {
      const client = clients.find(c => c.id === defaultValue);
      if (client) {
        setInputValue(client.nom);
      }
    }
  }, [defaultValue, clients]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {inputValue || "Sélectionner un client..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start" sideOffset={4}>
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Rechercher un client..." 
            value={inputValue}
            onValueChange={(value) => {
              setInputValue(value);
              // Si la valeur saisie ne correspond à aucun client existant
              if (value && !clients.some(client => client.nom.toLowerCase() === value.toLowerCase())) {
                onClientSelect(null, value);
              }
            }}
          />
          <CommandEmpty>
            {loading ? (
              "Chargement des clients..."
            ) : (
              `Aucun client trouvé. Appuyez sur Entrée pour créer "${inputValue || ''}"`
            )}
          </CommandEmpty>
          {!loading && filteredClients && filteredClients.length > 0 && (
            <CommandGroup>
              {filteredClients.map((client) => (
                <CommandItem
                  key={client.id}
                  value={client.id}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === client.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {client.nom}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
