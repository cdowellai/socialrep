import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, Check, X, Loader2 } from "lucide-react";
import { useTeam, type TeamMember } from "@/hooks/useTeam";
import { cn } from "@/lib/utils";

interface AssignToDropdownProps {
  assignedTo: string | null;
  onAssign: (userId: string | null) => Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerClassName?: string;
}

export function AssignToDropdown({
  assignedTo,
  onAssign,
  open,
  onOpenChange,
  triggerClassName,
}: AssignToDropdownProps) {
  const { members, loading: membersLoading } = useTeam();
  const [assigning, setAssigning] = useState<string | null>(null);

  const handleAssign = async (userId: string | null) => {
    setAssigning(userId || "unassign");
    try {
      await onAssign(userId);
    } finally {
      setAssigning(null);
      onOpenChange?.(false);
    }
  };

  const assignedMember = members.find((m) => m.user_id === assignedTo);

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("gap-2", triggerClassName)}
        >
          {assignedMember ? (
            <>
              <Avatar className="h-5 w-5">
                <AvatarImage src={assignedMember.avatar_url || ""} />
                <AvatarFallback className="text-[10px]">
                  {(assignedMember.full_name || assignedMember.email || "U")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="max-w-24 truncate">
                {assignedMember.full_name || assignedMember.email?.split("@")[0]}
              </span>
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Assign
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {membersLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : members.length === 0 ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            No team members found
          </div>
        ) : (
          <>
            {members.map((member) => (
              <DropdownMenuItem
                key={member.id}
                onClick={() => handleAssign(member.user_id)}
                disabled={assigning !== null}
                className="flex items-center gap-2"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={member.avatar_url || ""} />
                  <AvatarFallback className="text-[10px]">
                    {(member.full_name || member.email || "U")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {member.full_name || member.email?.split("@")[0]}
                  </p>
                  {member.full_name && (
                    <p className="text-xs text-muted-foreground truncate">
                      {member.email}
                    </p>
                  )}
                </div>
                {assignedTo === member.user_id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
                {assigning === member.user_id && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </DropdownMenuItem>
            ))}

            {assignedTo && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleAssign(null)}
                  disabled={assigning !== null}
                  className="text-muted-foreground"
                >
                  <X className="h-4 w-4 mr-2" />
                  Unassign
                  {assigning === "unassign" && (
                    <Loader2 className="h-4 w-4 ml-auto animate-spin" />
                  )}
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
