import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MessageSquare, MessageCircle, Star, AtSign } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Interaction = Tables<"interactions">;

interface StreamTypeFilterTabsProps {
  interactions: Interaction[];
  selectedType: string | null;
  onSelectType: (type: string | null) => void;
}

const typeConfig = [
  { value: "comment", label: "Comments", icon: MessageCircle },
  { value: "message", label: "Messages", icon: MessageSquare },
  { value: "review", label: "Reviews", icon: Star },
  { value: "mention", label: "Mentions", icon: AtSign },
];

export function StreamTypeFilterTabs({
  interactions,
  selectedType,
  onSelectType,
}: StreamTypeFilterTabsProps) {
  // Count interactions by type
  const typeCounts = typeConfig.reduce((acc, type) => {
    acc[type.value] = interactions.filter(
      (i) => i.interaction_type === type.value
    ).length;
    return acc;
  }, {} as Record<string, number>);

  const totalCount = interactions.length;

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
      {/* All tab */}
      <button
        onClick={() => onSelectType(null)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
          selectedType === null
            ? "bg-primary text-primary-foreground"
            : "bg-muted hover:bg-muted/80 text-foreground"
        )}
      >
        All
        <Badge
          variant={selectedType === null ? "secondary" : "outline"}
          className={cn(
            "h-5 min-w-5 px-1.5 text-[10px] font-semibold",
            selectedType === null && "bg-primary-foreground/20 text-primary-foreground border-0"
          )}
        >
          {totalCount}
        </Badge>
      </button>

      {/* Type tabs */}
      {typeConfig.map((type) => {
        const count = typeCounts[type.value] || 0;
        const isSelected = selectedType === type.value;
        const Icon = type.icon;

        // Only show tabs that have at least 1 interaction or are selected
        if (count === 0 && !isSelected) return null;

        return (
          <button
            key={type.value}
            onClick={() => onSelectType(isSelected ? null : type.value)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
              isSelected
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {type.label}
            <Badge
              variant={isSelected ? "secondary" : "outline"}
              className={cn(
                "h-5 min-w-5 px-1.5 text-[10px] font-semibold",
                isSelected && "bg-primary-foreground/20 text-primary-foreground border-0"
              )}
            >
              {count}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}
