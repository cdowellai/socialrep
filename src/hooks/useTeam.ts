import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export type TeamRole = "owner" | "admin" | "member" | "viewer";

export interface Team {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
  invited_by: string | null;
  invited_at: string;
  accepted_at: string | null;
  created_at: string;
  // Joined from profiles
  email?: string;
  full_name?: string;
  avatar_url?: string;
}

export interface TeamInvitation {
  id: string;
  team_id: string;
  email: string;
  role: TeamRole;
  invited_by: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export function useTeam() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<TeamRole | null>(null);

  const fetchTeam = useCallback(async () => {
    if (!user) {
      setTeam(null);
      setMembers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get user's current team from profile or first team membership
      const { data: profile } = await supabase
        .from("profiles")
        .select("current_team_id")
        .eq("user_id", user.id)
        .maybeSingle();

      let teamId = profile?.current_team_id;

      // If no current team, get the first team user is a member of
      if (!teamId) {
        const { data: membership } = await supabase
          .from("team_members")
          .select("team_id")
          .eq("user_id", user.id)
          .not("accepted_at", "is", null)
          .limit(1)
          .maybeSingle();

        teamId = membership?.team_id;
      }

      if (!teamId) {
        setTeam(null);
        setMembers([]);
        setLoading(false);
        return;
      }

      // Fetch team details
      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .select("*")
        .eq("id", teamId)
        .maybeSingle();

      if (teamError || !teamData) {
        // Team not found or inaccessible — treat as no team
        setTeam(null);
        setMembers([]);
        setLoading(false);
        return;
      }
      setTeam(teamData);

      // Fetch team members with profile info
      const { data: membersData } = await supabase
        .from("team_members")
        .select(`
          *,
          profiles:user_id (
            email,
            full_name,
            avatar_url
          )
        `)
        .eq("team_id", teamId)
        .not("accepted_at", "is", null);

      // Transform members data
      const transformedMembers = (membersData || []).map((m: any) => ({
        ...m,
        email: m.profiles?.email,
        full_name: m.profiles?.full_name,
        avatar_url: m.profiles?.avatar_url,
      }));

      setMembers(transformedMembers);

      // Set current user's role
      const currentMember = transformedMembers.find((m: TeamMember) => m.user_id === user.id);
      setUserRole(currentMember?.role || null);

      // Fetch pending invitations (only for admins)
      if (currentMember?.role === "owner" || currentMember?.role === "admin") {
        const { data: invitationsData } = await supabase
          .from("team_invitations")
          .select("*")
          .eq("team_id", teamId)
          .gt("expires_at", new Date().toISOString());

        setInvitations(invitationsData || []);
      }
    } catch (err) {
      console.error("Error fetching team:", err);
      toast({
        title: "Error",
        description: "Failed to load team data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const updateTeamName = async (name: string) => {
    if (!team) return;

    const { error } = await supabase
      .from("teams")
      .update({ name, updated_at: new Date().toISOString() })
      .eq("id", team.id);

    if (error) throw error;
    setTeam({ ...team, name });
  };

  const inviteMember = async (email: string, role: TeamRole = "member") => {
    if (!team || !user) throw new Error("No team selected");

    // Check if user already exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("email", email)
      .single();

    if (existingProfile) {
      // User exists, add directly to team
      const { data: existingMember } = await supabase
        .from("team_members")
        .select("id")
        .eq("team_id", team.id)
        .eq("user_id", existingProfile.user_id)
        .single();

      if (existingMember) {
        throw new Error("User is already a member of this team");
      }

      const { error } = await supabase
        .from("team_members")
        .insert({
          team_id: team.id,
          user_id: existingProfile.user_id,
          role,
          invited_by: user.id,
          accepted_at: new Date().toISOString(), // Auto-accept for existing users
        });

      if (error) throw error;
    } else {
      // Create invitation for new user
      const { error } = await supabase
        .from("team_invitations")
        .insert({
          team_id: team.id,
          email,
          role,
          invited_by: user.id,
        });

      if (error) throw error;
    }

    await fetchTeam();
  };

  const updateMemberRole = async (memberId: string, role: TeamRole) => {
    const { error } = await supabase
      .from("team_members")
      .update({ role })
      .eq("id", memberId);

    if (error) throw error;
    await fetchTeam();
  };

  const removeMember = async (memberId: string) => {
    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("id", memberId);

    if (error) throw error;
    await fetchTeam();
  };

  const cancelInvitation = async (invitationId: string) => {
    const { error } = await supabase
      .from("team_invitations")
      .delete()
      .eq("id", invitationId);

    if (error) throw error;
    await fetchTeam();
  };

  const isAdmin = userRole === "owner" || userRole === "admin";
  const isOwner = userRole === "owner";

  return {
    team,
    members,
    invitations,
    loading,
    userRole,
    isAdmin,
    isOwner,
    refetch: fetchTeam,
    updateTeamName,
    inviteMember,
    updateMemberRole,
    removeMember,
    cancelInvitation,
  };
}
