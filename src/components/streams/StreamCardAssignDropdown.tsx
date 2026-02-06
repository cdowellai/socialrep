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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserPlus, Check, X, Loader2 } from "lucide-react";
import { useTeam, type TeamMember } from "@/hooks/useTeam";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface StreamCardAssignDropdownProps {
  interactionId: string;
  assignedTo: string | null;
  onAssign?: (interactionId: string, userId: string | null) => void;
  compact?: boolean;
}

export function StreamCardAssignDropdown({
  interactionId,
  assignedTo,
  onAssign,
  compact = false,
}: StreamCardAssignDropdownProps) {
  const { members, loading: membersLoading } = useTeam();
  const { toast } = useToast();
  const [assigning, setAssigning] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const assignedMember = members.find((m) => m.user_id === assignedTo);

  const handleAssign = async (userId: string | null) => {
    setAssigning(userId || "unassign");
    try {
      const { error } = await supabase
        .from("interactions")
        .update({ assigned_to: userId })
        .eq("id", interactionId);

      if (error) throw error;

      onAssign?.(interactionId, userId);
      
      toast({
        title: userId ? "Assigned" : "Unassigned",
        description: userId
          ? `Assigned to ${members.find((m) => m.user_id === userId)?.full_name || "team member"}`
          : "Interaction unassigned",
      });
    } catch (error) {
      console.error("Error assigning interaction:", error);
      toast({
        title: "Error",
        description: "Failed to assign interaction",
        variant: "destructive",
      });
    } finally {
      setAssigning(null);
      setIsOpen(false);
    }
  };

  if (compact) {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              {assignedMember ? (
                <button className="focus:outline-none">
                  <Avatar className="h-6 w-6 hover:ring-2 hover:ring-primary/50 transition-all">
                    <AvatarImage src={assignedMember.avatar_url || ""} />
                    <AvatarFallback className="text-[10px]">
                      {(assignedMember.full_name || assignedMember.email || "U")[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              ) : (
                <button className="flex items-center justify-center h-6 w-6 rounded-full border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50 transition-all focus:outline-none">
                  <UserPlus className="h-3 w-3 text-muted-foreground" />
                </button>
              )}
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="top">
            {assignedMember
              ? `Assigned to ${assignedMember.full_name || assignedMember.email}`
              : "Assign to team member"}
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="center" className="w-48">
          {membersLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : members.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              No team members
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
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={member.avatar_url || ""} />
                    <AvatarFallback className="text-[9px]">
                      {(member.full_name || member.email || "U")[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 truncate text-sm">
                    {member.full_name || member.email?.split("@")[0]}
                  </span>
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

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 gap-1.5 text-xs",
            assignedMember ? "px-2" : "px-2"
          )}
        >
          {assignedMember ? (
            <>
              <Avatar className="h-5 w-5">
                <AvatarImage src={assignedMember.avatar_url || ""} />
                <AvatarFallback className="text-[9px]">
                  {(assignedMember.full_name || assignedMember.email || "U")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="max-w-16 truncate hidden sm:inline">
                {assignedMember.full_name?.split(" ")[0] || assignedMember.email?.split("@")[0]}
              </span>
            </>
          ) : (
            <>
              <UserPlus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Assign</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {membersLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : members.length === 0 ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            No team members
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
                <Avatar className="h-5 w-5">
                  <AvatarImage src={member.avatar_url || ""} />
                  <AvatarFallback className="text-[9px]">
                    {(member.full_name || member.email || "U")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 truncate text-sm">
                  {member.full_name || member.email?.split("@")[0]}
                </span>
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
