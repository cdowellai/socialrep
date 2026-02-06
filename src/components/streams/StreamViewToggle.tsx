import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

export type StreamViewMode = "grid" | "list";

interface StreamViewToggleProps {
  viewMode: StreamViewMode;
  onViewModeChange: (mode: StreamViewMode) => void;
}

export function StreamViewToggle({
  viewMode,
  onViewModeChange,
}: StreamViewToggleProps) {
  return (
    <div className="flex items-center rounded-lg border bg-muted/30 p-0.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 w-7 p-0 rounded-md transition-colors",
              viewMode === "grid"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => onViewModeChange("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Card View</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 w-7 p-0 rounded-md transition-colors",
              viewMode === "list"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => onViewModeChange("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">List View</TooltipContent>
      </Tooltip>
    </div>
  );
}
