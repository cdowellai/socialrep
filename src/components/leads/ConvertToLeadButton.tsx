import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2, Check } from "lucide-react";
import { useLeads } from "@/hooks/useLeads";
import type { Tables } from "@/integrations/supabase/types";

type Interaction = Tables<"interactions">;

interface ConvertToLeadButtonProps {
  interaction: Interaction;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ConvertToLeadButton({
  interaction,
  variant = "outline",
  size = "sm",
  className,
}: ConvertToLeadButtonProps) {
  const { convertInteractionToLead, leads } = useLeads();
  const [loading, setLoading] = useState(false);
  const [converted, setConverted] = useState(false);

  // Check if this interaction is already linked to a lead
  const existingLead = leads.find(
    (lead) => lead.source_interaction_id === interaction.id
  );

  const handleConvert = async () => {
    if (existingLead || converted) return;

    setLoading(true);
    try {
      await convertInteractionToLead(interaction);
      setConverted(true);
    } catch (error) {
      console.error("Error converting to lead:", error);
    } finally {
      setLoading(false);
    }
  };

  if (existingLead || converted) {
    return (
      <Button
        variant="ghost"
        size={size}
        className={className}
        disabled
      >
        <Check className="h-4 w-4 mr-2 text-sentiment-positive" />
        Lead Created
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleConvert}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <UserPlus className="h-4 w-4 mr-2" />
      )}
      Convert to Lead
    </Button>
  );
}
