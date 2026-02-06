import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CheckCircle2,
  Archive,
  UserPlus,
  X,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { useTeam } from "@/hooks/useTeam";
import { cn } from "@/lib/utils";

interface FloatingBulkActionsProps {
  selectedCount: number;
  onMarkResolved: () => Promise<void>;
  onArchive: () => Promise<void>;
  onAssign: (userId: string | null) => Promise<void>;
  onClear: () => void;
  className?: string;
}

export function FloatingBulkActions({
  selectedCount,
  onMarkResolved,
  onArchive,
  onAssign,
  onClear,
  className,
}: FloatingBulkActionsProps) {
  const { members } = useTeam();
  const [loading, setLoading] = useState<string | null>(null);

  if (selectedCount === 0) return null;

  const handleAction = async (action: () => Promise<void>, key: string) => {
    setLoading(key);
    try {
      await action();
    } finally {
      setLoading(null);
    }
  };

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
        "flex items-center gap-2 px-4 py-3 rounded-xl",
        "bg-background border shadow-lg",
        "animate-in slide-in-from-bottom-4 duration-200",
        className
      )}
    >
      <span className="text-sm font-medium mr-2">
        {selectedCount} selected
      </span>

      <Button
        variant="secondary"
        size="sm"
        onClick={() => handleAction(onMarkResolved, "resolve")}
        disabled={loading !== null}
      >
        {loading === "resolve" ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <CheckCircle2 className="h-4 w-4 mr-2" />
        )}
        Mark Resolved
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="sm" disabled={loading !== null}>
            <UserPlus className="h-4 w-4 mr-2" />
            Assign to
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          {members.map((member) => (
            <DropdownMenuItem
              key={member.id}
              onClick={() => handleAction(() => onAssign(member.user_id), `assign-${member.user_id}`)}
              className="flex items-center gap-2"
            >
              <Avatar className="h-5 w-5">
                <AvatarImage src={member.avatar_url || ""} />
                <AvatarFallback className="text-[10px]">
                  {(member.full_name || member.email || "U")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{member.full_name || member.email?.split("@")[0]}</span>
              {loading === `assign-${member.user_id}` && (
                <Loader2 className="h-3 w-3 ml-auto animate-spin" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="secondary"
        size="sm"
        onClick={() => handleAction(onArchive, "archive")}
        disabled={loading !== null}
      >
        {loading === "archive" ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Archive className="h-4 w-4 mr-2" />
        )}
        Archive
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onClear}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
