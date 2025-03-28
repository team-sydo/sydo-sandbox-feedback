
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ClientOption {
  value: string;
  label: string;
}

interface ClientComboboxProps {
  value: ClientOption | null;
  onChange: (value: ClientOption | null) => void;
  placeholder?: string;
  emptyMessage?: string;
  items?: ClientOption[]; // Make items optional with default value
}

export function ClientCombobox({ 
  value, 
  onChange, 
  placeholder = "Sélectionner un client", 
  emptyMessage = "Aucun client trouvé",
  items = [] // Default to empty array
}: ClientComboboxProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [clientOptions, setClientOptions] = useState<ClientOption[]>([]); // Initialize with empty array
  const [isLoading, setIsLoading] = useState(false);

  // Initialize clientOptions with provided items if available
  useEffect(() => {
    if (items && items.length > 0) {
      setClientOptions(items);
    }
  }, [items]);

  // Charger la liste des clients depuis Supabase
  useEffect(() => {
    const fetchClients = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('clients')
          .select('id, nom')
          .eq('user_id', user.id)
          .order('nom');
        
        if (error) throw error;
        
        // Transformer les données pour le combobox
        const options = (data || []).map((client) => ({
          value: client.id,
          label: client.nom
        }));
        
        setClientOptions(options);
      } catch (error) {
        console.error("Error loading clients:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClients();
  }, [user]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value ? value.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandEmpty>{isLoading ? "Chargement..." : emptyMessage}</CommandEmpty>
          <CommandGroup className="max-h-60 overflow-auto">
            {Array.isArray(clientOptions) && clientOptions.length > 0 ? (
              clientOptions.map((client) => (
                <CommandItem
                  key={client.value}
                  value={client.value}
                  onSelect={() => {
                    onChange(client.value === value?.value ? null : client);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value?.value === client.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {client.label}
                </CommandItem>
              ))
            ) : (
              <CommandItem disabled>Aucune option disponible</CommandItem>
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
