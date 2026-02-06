import { useState, useEffect } from "react";
import { useTeam, type TeamRole, type TeamMember, type TeamInvitation } from "@/hooks/useTeam";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Crown,
  Shield,
  User,
  Eye,
  Mail,
  Trash2,
  Clock,
  Plus,
  Loader2,
  Building2,
  Edit2,
  Check,
  X,
  MoreHorizontal,
  UserMinus,
  UserCog,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

interface PlanLimits {
  maxSeats: number;
  planName: string;
}

export function TeamManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
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

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamRole>("member");
  const [inviting, setInviting] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [teamNameInput, setTeamNameInput] = useState("");
  const [planLimits, setPlanLimits] = useState<PlanLimits>({ maxSeats: 1, planName: "Free" });

  useEffect(() => {
    if (user) {
      fetchPlanLimits();
    }
  }, [user]);

  const fetchPlanLimits = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("plan")
      .eq("user_id", user.id)
      .single();

    const planSeats: Record<string, { maxSeats: number; planName: string }> = {
      free: { maxSeats: 1, planName: "Free" },
      starter: { maxSeats: 2, planName: "Starter" },
      professional: { maxSeats: 5, planName: "Professional" },
      agency: { maxSeats: 15, planName: "Agency" },
    };

    const plan = data?.plan || "free";
    setPlanLimits(planSeats[plan] || planSeats.free);
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;

    try {
      setInviting(true);
      await inviteMember(inviteEmail, inviteRole);
      toast({
        title: "Invitation sent",
        description: `${inviteEmail} has been invited to the team`,
      });
      setInviteEmail("");
      setInviteRole("member");
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
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    try {
      await removeMember(memberId);
      toast({
        title: "Member removed",
        description: `${memberName} has been removed from the team`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
    }
  };

  const handleCancelInvitation = async (invitationId: string, email: string) => {
    try {
      await cancelInvitation(invitationId);
      toast({
        title: "Invitation cancelled",
        description: `Invitation to ${email} has been cancelled`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to cancel invitation",
        variant: "destructive",
      });
    }
  };

  const handleSaveTeamName = async () => {
    if (!teamNameInput.trim()) return;
    try {
      await updateTeamName(teamNameInput.trim());
      setEditingName(false);
      toast({ title: "Team name updated" });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update team name",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
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
            You're not part of any team yet. Please sign in again to create your team.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Info Card */}
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
                      placeholder="Team name"
                      autoFocus
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
                        onClick={() => {
                          setTeamNameInput(team.name);
                          setEditingName(true);
                        }}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}
                <CardDescription>
                  {members.length} member{members.length !== 1 ? "s" : ""}
                  {invitations.length > 0 && ` • ${invitations.length} pending invitation${invitations.length !== 1 ? "s" : ""}`}
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
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Seats used</span>
                <span className="font-medium">{members.length} of {planLimits.maxSeats}</span>
              </div>
              <Progress value={(members.length / planLimits.maxSeats) * 100} className="h-2" />
            </div>
            <Badge variant="outline" className="text-xs">
              {planLimits.planName} Plan
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Invite Member Card - Admin Only */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Invite Team Member
            </CardTitle>
            <CardDescription>
              Invite new members to collaborate on your social media management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="email" className="sr-only">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as TeamRole)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleInvite} disabled={!inviteEmail || inviting}>
                {inviting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Invite
                  </>
                )}
              </Button>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              <p><strong>Admin:</strong> Can manage team members and all settings</p>
              <p><strong>Member:</strong> Can respond to messages and manage interactions</p>
              <p><strong>Viewer:</strong> Can view interactions but cannot respond</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                currentUserId={user?.id || ""}
                isAdmin={isAdmin}
                isOwner={isOwner}
                onUpdateRole={handleUpdateRole}
                onRemove={handleRemoveMember}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations - Admin Only */}
      {isAdmin && invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Invitations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <InvitationRow
                  key={invitation.id}
                  invitation={invitation}
                  onCancel={handleCancelInvitation}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface MemberRowProps {
  member: TeamMember;
  currentUserId: string;
  isAdmin: boolean;
  isOwner: boolean;
  onUpdateRole: (memberId: string, role: TeamRole) => void;
  onRemove: (memberId: string, memberName: string) => void;
}

function MemberRow({ member, currentUserId, isAdmin, isOwner, onUpdateRole, onRemove }: MemberRowProps) {
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const RoleIcon = roleIcons[member.role];
  const isCurrentUser = member.user_id === currentUserId;
  const canModify = isAdmin && !isCurrentUser && member.role !== "owner";
  const canChangeRole = isOwner && member.role !== "owner";

  // Calculate last active (using accepted_at as proxy for now)
  const lastActive = member.accepted_at
    ? new Date(member.accepted_at).toLocaleDateString()
    : "Never";

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={member.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {(member.full_name || member.email || "?").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {member.full_name || member.email || "Unknown"}
            </span>
            {isCurrentUser && (
              <Badge variant="outline" className="text-xs">You</Badge>
            )}
            <Badge className="bg-sentiment-positive/10 text-sentiment-positive text-xs">
              Active
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{member.email}</span>
            <span>•</span>
            <span>Last active: {lastActive}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge className={roleColors[member.role]}>
          <RoleIcon className="h-3 w-3 mr-1" />
          {roleLabels[member.role]}
        </Badge>

        {canModify && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canChangeRole && (
                  <>
                    <DropdownMenuItem onClick={() => onUpdateRole(member.id, "admin")}>
                      <Shield className="h-4 w-4 mr-2" />
                      Make Admin
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onUpdateRole(member.id, "member")}>
                      <User className="h-4 w-4 mr-2" />
                      Make Member
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onUpdateRole(member.id, "viewer")}>
                      <Eye className="h-4 w-4 mr-2" />
                      Make Viewer
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setShowRemoveDialog(true)}
                >
                  <UserMinus className="h-4 w-4 mr-2" />
                  Remove from team
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove team member?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to remove {member.full_name || member.email} from the team?
                    They will lose access to all team resources.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => {
                      onRemove(member.id, member.full_name || member.email || "Unknown");
                      setShowRemoveDialog(false);
                    }}
                  >
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </div>
  );
}

interface InvitationRowProps {
  invitation: TeamInvitation;
  onCancel: (invitationId: string, email: string) => void;
}

function InvitationRow({ invitation, onCancel }: InvitationRowProps) {
  const RoleIcon = roleIcons[invitation.role];
  const expiresAt = new Date(invitation.expires_at);
  const daysLeft = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
          <Mail className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <span className="font-medium">{invitation.email}</span>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className={roleColors[invitation.role]}>
              <RoleIcon className="h-3 w-3 mr-1" />
              {roleLabels[invitation.role]}
            </Badge>
            <span>• Expires in {daysLeft} day{daysLeft !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive"
        onClick={() => onCancel(invitation.id, invitation.email)}
      >
        <X className="h-4 w-4 mr-1" />
        Cancel
      </Button>
    </div>
  );
}

// Need to import React for createElement
import React from "react";
