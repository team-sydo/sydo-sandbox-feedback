
import { Switch } from "@/components/ui/switch";

interface RetourToggleProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
}

export function RetourToggle({ isEnabled, onToggle, disabled }: RetourToggleProps) {
  return (
    <Switch
      checked={isEnabled}
      onCheckedChange={onToggle}
      disabled={disabled}
      aria-label="Toggle retours"
    />
  );
}
