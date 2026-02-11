import { useState } from "react";
import React from "react";
import { useTeam, type TeamRole, type TeamMember, type TeamInvitation } from "@/hooks/useTeam";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Crown,
  Shield,
  User,
  Eye,
  Mail,
  Clock,
  Plus,
  Loader2,
  Building2,
  Edit2,
  Check,
  X,
  MoreHorizontal,
  UserMinus,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const roleIcons: Record<TeamRole, typeof Crown> = {
  owner: Crown,
  admin: Shield,
  member: User,
  viewer: Eye,
};

const roleLabels: Record<TeamRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
  viewer: "Viewer",
};

const roleColors: Record<TeamRole, string> = {
  owner: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  admin: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  member: "bg-green-500/10 text-green-600 border-green-500/20",
  viewer: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

export function TeamManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { plan: currentPlan } = useSubscription();
  const {
    team,
    members,
    invitations,
    loading,
    userRole,
    isAdmin,
    isOwner,
    updateTeamName,
    inviteMember,
    updateMemberRole,
    removeMember,
    cancelInvitation,
  } = useTeam();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamRole>("member");
  const [inviting, setInviting] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [teamNameInput, setTeamNameInput] = useState("");
  const [removeTarget, setRemoveTarget] = useState<{ id: string; name: string } | null>(null);

  const maxSeats = currentPlan?.max_team_seats ?? 1;
  const planName = currentPlan?.display_name ?? "Free";
  const isEffectiveAdmin = isAdmin || (team && user && team.owner_id === user.id);
  const isEffectiveOwner = isOwner || (team && user && team.owner_id === user.id);

  // Build display members: always ensure the owner row exists
  const ownerInMembers = members.some((m) => m.role === "owner");
  const displayMembers: TeamMember[] = ownerInMembers
    ? members
    : [
        {
          id: "owner-synthetic",
          team_id: team?.id || "",
          user_id: user?.id || "",
          role: "owner" as TeamRole,
          invited_by: null,
          invited_at: team?.created_at || new Date().toISOString(),
          accepted_at: team?.created_at || new Date().toISOString(),
          created_at: team?.created_at || new Date().toISOString(),
          full_name: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Owner",
          email: user?.email || "",
          avatar_url: user?.user_metadata?.avatar_url || null,
        },
        ...members,
      ];

  const totalOccupied = displayMembers.length + invitations.length;
  const seatsDisplay = maxSeats === -1 ? "∞" : maxSeats;
  const seatPercent = maxSeats === -1 ? 0 : (totalOccupied / maxSeats) * 100;

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;

    if (maxSeats !== -1 && totalOccupied >= maxSeats) {
      toast({
        title: "Seat limit reached",
        description: `You've reached your seat limit on the ${planName} plan (${maxSeats} seats). Upgrade to add more.`,
        variant: "destructive",
      });
      return;
    }

    try {
      setInviting(true);
      await inviteMember(inviteEmail.trim(), inviteRole);
      toast({
        title: "Invitation sent",
        description: `${inviteEmail} has been invited as ${roleLabels[inviteRole]}`,
      });
      setInviteEmail("");
      setInviteRole("member");
      setInviteOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to invite member",
        variant: "destructive",
      });
    } finally {
      setInviting(false);
    }
  };

  const handleUpdateRole = async (memberId: string, role: TeamRole) => {
    try {
      await updateMemberRole(memberId, role);
      toast({ title: "Role updated" });
    } catch {
      toast({ title: "Error", description: "Failed to update role", variant: "destructive" });
    }
  };

  const handleRemoveMember = async () => {
    if (!removeTarget) return;
    try {
      await removeMember(removeTarget.id);
      toast({ title: "Member removed", description: `${removeTarget.name} has been removed` });
    } catch {
      toast({ title: "Error", description: "Failed to remove member", variant: "destructive" });
    } finally {
      setRemoveTarget(null);
    }
  };

  const handleCancelInvitation = async (id: string, email: string) => {
    try {
      await cancelInvitation(id);
      toast({ title: "Invitation cancelled", description: `Invitation to ${email} cancelled` });
    } catch {
      toast({ title: "Error", description: "Failed to cancel invitation", variant: "destructive" });
    }
  };

  const handleSaveTeamName = async () => {
    if (!teamNameInput.trim()) return;
    try {
      await updateTeamName(teamNameInput.trim());
      setEditingName(false);
      toast({ title: "Team name updated" });
    } catch {
      toast({ title: "Error", description: "Failed to update team name", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!team) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Team Found</h3>
          <p className="text-muted-foreground">
            Your team will be created automatically. Please sign in again.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={teamNameInput}
                      onChange={(e) => setTeamNameInput(e.target.value)}
                      className="h-8 w-48"
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && handleSaveTeamName()}
                    />
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSaveTeamName}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingName(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CardTitle>{team.name}</CardTitle>
                    {isAdmin && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => { setTeamNameInput(team.name); setEditingName(true); }}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}
                <CardDescription className="mt-1">
                  {planName} Plan
                </CardDescription>
              </div>
            </div>
            {userRole && (
              <Badge className={roleColors[userRole]}>
                {React.createElement(roleIcons[userRole], { className: "h-3 w-3 mr-1" })}
                {roleLabels[userRole]}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Seats used</span>
            <span className="font-medium">{totalOccupied} of {seatsDisplay}</span>
          </div>
          <Progress value={Math.min(seatPercent, 100)} className="h-2" />
          {maxSeats !== -1 && totalOccupied >= maxSeats && (
            <p className="text-xs text-destructive mt-2 flex items-center gap-1">
              Seat limit reached.{" "}
              <button
                onClick={() => navigate("/dashboard/settings?tab=billing")}
                className="underline hover:no-underline font-medium inline-flex items-center gap-0.5"
              >
                Upgrade plan <ArrowUpRight className="h-3 w-3" />
              </button>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members
            </CardTitle>
            {isEffectiveAdmin && (
              <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Invite Team Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                      Send an invitation to join your team. They'll get access once they sign up or accept.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="invite-email">Email address</Label>
                      <Input
                        id="invite-email"
                        type="email"
                        placeholder="colleague@company.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as TeamRole)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              Admin — Full management access
                            </div>
                          </SelectItem>
                          <SelectItem value="member">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Member — Can respond & manage interactions
                            </div>
                          </SelectItem>
                          <SelectItem value="viewer">
                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              Viewer — Read-only access
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
                    <Button onClick={handleInvite} disabled={!inviteEmail.trim() || inviting}>
                      {inviting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Mail className="h-4 w-4 mr-2" />
                      )}
                      Send Invitation
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Active Members — owner first */}
              {[...displayMembers]
                .sort((a, b) => {
                  if (a.role === "owner") return -1;
                  if (b.role === "owner") return 1;
                  return 0;
                })
                .map((member) => {
                  const RoleIcon = roleIcons[member.role];
                  const isCurrentUser = member.user_id === user?.id;
                  const canModify = isEffectiveAdmin && !isCurrentUser && member.role !== "owner";
                  const canChangeRole = isEffectiveOwner && member.role !== "owner";

                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {(member.full_name || member.email || "?").charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {member.full_name || "—"}
                            {isCurrentUser && (
                              <span className="text-xs text-muted-foreground ml-2">(you)</span>
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{member.email || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={roleColors[member.role]}>
                          <RoleIcon className="h-3 w-3 mr-1" />
                          {roleLabels[member.role]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {canModify && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {canChangeRole && (
                                <>
                                  <DropdownMenuItem onClick={() => handleUpdateRole(member.id, "admin")}>
                                    <Shield className="h-4 w-4 mr-2" /> Make Admin
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUpdateRole(member.id, "member")}>
                                    <User className="h-4 w-4 mr-2" /> Make Member
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUpdateRole(member.id, "viewer")}>
                                    <Eye className="h-4 w-4 mr-2" /> Make Viewer
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() =>
                                  setRemoveTarget({
                                    id: member.id,
                                    name: member.full_name || member.email || "this member",
                                  })
                                }
                              >
                                <UserMinus className="h-4 w-4 mr-2" /> Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}

              {/* Pending Invitations */}
              {invitations.map((inv) => {
                const RoleIcon = roleIcons[inv.role];
                const daysLeft = Math.max(
                  0,
                  Math.ceil((new Date(inv.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                );

                return (
                  <TableRow key={inv.id} className="opacity-70">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="text-muted-foreground italic">Pending</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{inv.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={roleColors[inv.role]}>
                        <RoleIcon className="h-3 w-3 mr-1" />
                        {roleLabels[inv.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                        <Clock className="h-3 w-3 mr-1" />
                        Invited · {daysLeft}d left
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {isEffectiveAdmin && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              toast({ title: "Invite resent", description: `Invitation resent to ${inv.email}` });
                            }}>
                              <RefreshCw className="h-4 w-4 mr-2" /> Resend Invite
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleCancelInvitation(inv.id, inv.email)}
                            >
                              <X className="h-4 w-4 mr-2" /> Cancel Invite
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}

              {displayMembers.length === 0 && invitations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No team members yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove team member?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {removeTarget?.name} from the team? They will lose access to all team resources.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleRemoveMember}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
