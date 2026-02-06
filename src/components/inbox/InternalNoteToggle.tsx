import { Button } from "@/components/ui/button";
import { MessageSquare, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";

interface InternalNoteToggleProps {
  isInternal: boolean;
  onToggle: (isInternal: boolean) => void;
  disabled?: boolean;
}

export function InternalNoteToggle({
  isInternal,
  onToggle,
  disabled,
}: InternalNoteToggleProps) {
  return (
    <div className="flex items-center rounded-lg border bg-muted/30 p-0.5">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={disabled}
        onClick={() => onToggle(false)}
        className={cn(
          "h-7 px-3 text-xs gap-1.5 rounded-md transition-colors",
          !isInternal
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <MessageSquare className="h-3.5 w-3.5" />
        Reply
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={disabled}
        onClick={() => onToggle(true)}
        className={cn(
          "h-7 px-3 text-xs gap-1.5 rounded-md transition-colors",
          isInternal
            ? "bg-accent shadow-sm text-accent-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <StickyNote className="h-3.5 w-3.5" />
        Internal Note
      </Button>
    </div>
  );
}
