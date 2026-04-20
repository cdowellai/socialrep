import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InvitationRecord {
  id: string;
  team_id: string;
  email: string;
  role: "owner" | "admin" | "member" | "viewer";
  expires_at: string;
}

interface TeamRecord {
  id: string;
  name: string;
}

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [invitation, setInvitation] = useState<InvitationRecord | null>(null);
  const [team, setTeam] = useState<TeamRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("No invitation token provided.");
      setLoading(false);
      return;
    }

    (async () => {
      const { data: inv, error: invErr } = await supabase
        .from("team_invitations")
        .select("id, team_id, email, role, expires_at")
        .eq("token", token)
        .maybeSingle();

      if (invErr || !inv) {
        setError("This invitation is invalid or has already been used.");
        setLoading(false);
        return;
      }

      if (new Date(inv.expires_at).getTime() < Date.now()) {
        setError("This invitation has expired. Please ask for a new one.");
        setLoading(false);
        return;
      }

      const { data: teamData } = await supabase
        .from("teams")
        .select("id, name")
        .eq("id", inv.team_id)
        .maybeSingle();

      setInvitation(inv as InvitationRecord);
      setTeam(teamData as TeamRecord | null);
      setLoading(false);
    })();
  }, [token]);

  const handleAccept = async () => {
    if (!invitation || !user) return;

    if (user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
      toast({
        title: "Email mismatch",
        description: `This invitation was sent to ${invitation.email}. Please sign in with that email.`,
        variant: "destructive",
      });
      return;
    }

    try {
      setAccepting(true);

      // Check if already a member
      const { data: existing } = await supabase
        .from("team_members")
        .select("id")
        .eq("team_id", invitation.team_id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!existing) {
        const { error: insertErr } = await supabase.from("team_members").insert({
          team_id: invitation.team_id,
          user_id: user.id,
          role: invitation.role,
          accepted_at: new Date().toISOString(),
        });
        if (insertErr) throw insertErr;
      }

      // Set as current team
      await supabase
        .from("profiles")
        .update({ current_team_id: invitation.team_id })
        .eq("user_id", user.id);

      // Delete invitation
      await supabase.from("team_invitations").delete().eq("id", invitation.id);

      toast({
        title: "Welcome to the team!",
        description: `You've joined ${team?.name ?? "the team"}.`,
      });
      navigate("/dashboard");
    } catch (err) {
      toast({
        title: "Could not accept invitation",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setAccepting(false);
    }
  };

  const handleSignIn = () => {
    sessionStorage.setItem("pending_invite_token", token || "");
    navigate(`/?invite=${token}`);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            {error ? (
              <XCircle className="h-6 w-6 text-destructive" />
            ) : (
              <Mail className="h-6 w-6 text-primary" />
            )}
          </div>
          <CardTitle>
            {error ? "Invitation problem" : `Join ${team?.name ?? "the team"}`}
          </CardTitle>
          <CardDescription>
            {error ??
              `You've been invited to join as ${invitation?.role}. Accept to get access.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {error ? (
            <Button className="w-full" onClick={() => navigate("/")}>
              Go home
            </Button>
          ) : !user ? (
            <>
              <p className="text-sm text-muted-foreground text-center">
                Sign in or create an account with{" "}
                <span className="font-medium">{invitation?.email}</span> to accept.
              </p>
              <Button className="w-full" onClick={handleSignIn}>
                Sign in / Sign up
              </Button>
            </>
          ) : (
            <Button className="w-full" onClick={handleAccept} disabled={accepting}>
              {accepting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Accept invitation
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
