
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
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClientName, setSelectedClientName] = useState("");

  // Fetch clients on component mount
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

        // Ensure data is an array even if the response is empty
        const clientData = data || [];
        setClients(clientData);
        setFilteredClients(clientData);
      } catch (error) {
        console.error("Erreur lors du chargement des clients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Set initial selected client name when default value exists
  useEffect(() => {
    if (defaultValue && clients.length > 0) {
      const client = clients.find(c => c.id === defaultValue);
      if (client) {
        setSelectedClientName(client.nom);
        setInputValue(client.nom);
      }
    }
  }, [defaultValue, clients]);

  // Update filtered clients whenever input value changes
  useEffect(() => {
    if (!clients || clients.length === 0) {
      setFilteredClients([]);
      return;
    }
    
    if (!inputValue) {
      setFilteredClients(clients);
      return;
    }
    
    const filtered = clients.filter(client => 
      client.nom.toLowerCase().includes(inputValue.toLowerCase())
    );
    
    setFilteredClients(filtered);
  }, [inputValue, clients]);

  const handleSelect = (currentValue: string) => {
    // Handle the case when a client is selected
    const selectedClient = clients.find(client => client.id === currentValue);
    
    if (selectedClient) {
      setValue(currentValue);
      setInputValue(selectedClient.nom);
      setSelectedClientName(selectedClient.nom);
      onClientSelect(selectedClient.id, selectedClient.nom);
    } else {
      // Handle the case when a new client name is entered
      setValue("");
      setInputValue(currentValue);
      setSelectedClientName(currentValue);
      onClientSelect(null, currentValue);
    }
    
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedClientName || inputValue || "Sélectionner un client..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Rechercher un client..." 
            value={inputValue}
            onValueChange={(value) => {
              setInputValue(value);
              if (value && !clients.some(client => client.nom.toLowerCase() === value.toLowerCase())) {
                onClientSelect(null, value);
              }
            }}
          />
          {loading ? (
            <CommandEmpty>Chargement des clients...</CommandEmpty>
          ) : (
            <>
              <CommandEmpty>
                {inputValue ? `Aucun client trouvé. Appuyez sur Entrée pour créer "${inputValue}"` : "Aucun client trouvé"}
              </CommandEmpty>
              <CommandGroup>
                {filteredClients && filteredClients.map((client) => (
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
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
