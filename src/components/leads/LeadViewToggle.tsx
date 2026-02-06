import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

export type LeadViewMode = "table" | "kanban";

interface LeadViewToggleProps {
  viewMode: LeadViewMode;
  onViewModeChange: (mode: LeadViewMode) => void;
}

export function LeadViewToggle({ viewMode, onViewModeChange }: LeadViewToggleProps) {
  return (
    <div className="flex items-center rounded-lg border bg-muted/30 p-0.5">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewModeChange("table")}
        className={cn(
          "h-8 px-3 gap-2 rounded-md transition-colors",
          viewMode === "table"
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <List className="h-4 w-4" />
        Table
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewModeChange("kanban")}
        className={cn(
          "h-8 px-3 gap-2 rounded-md transition-colors",
          viewMode === "kanban"
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        Kanban
      </Button>
    </div>
  );
}
