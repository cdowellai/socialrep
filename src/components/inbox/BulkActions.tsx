import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckSquare,
  XSquare,
  Archive,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ChevronDown,
} from "lucide-react";

interface BulkActionsProps {
  selectedCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkArchive: () => void;
  onBulkEscalate: () => void;
  onBulkMarkResponded: () => void;
  onBulkDelete: () => void;
}

export function BulkActions({
  selectedCount,
  onSelectAll,
  onDeselectAll,
  onBulkArchive,
  onBulkEscalate,
  onBulkMarkResponded,
  onBulkDelete,
}: BulkActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onSelectAll}>
          <CheckSquare className="h-4 w-4 mr-1" />
          Select All
        </Button>
        {selectedCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onDeselectAll}>
            <XSquare className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {selectedCount > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Actions ({selectedCount})
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={onBulkMarkResponded}>
              <CheckCircle2 className="h-4 w-4 mr-2 text-sentiment-positive" />
              Mark as Responded
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onBulkEscalate}>
              <AlertTriangle className="h-4 w-4 mr-2 text-sentiment-negative" />
              Escalate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onBulkArchive}>
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onBulkDelete} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
