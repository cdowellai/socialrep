import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

type Status = "validating" | "ready" | "already" | "invalid" | "submitting" | "done" | "error";

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("validating");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    (async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const res = await fetch(
          `${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: supabaseAnonKey } }
        );
        const json = await res.json();
        if (json.valid) setStatus("ready");
        else if (json.reason === "already_unsubscribed") setStatus("already");
        else setStatus("invalid");
      } catch {
        setStatus("invalid");
      }
    })();
  }, [token]);

  const handleConfirm = async () => {
    if (!token) return;
    setStatus("submitting");
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) throw error;
      if (data?.success) setStatus("done");
      else if (data?.reason === "already_unsubscribed") setStatus("already");
      else setStatus("error");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>
            {status === "done" || status === "already"
              ? "You're unsubscribed"
              : status === "invalid"
              ? "Invalid link"
              : "Unsubscribe from emails"}
          </CardTitle>
          <CardDescription>
            {status === "validating" && "Checking your link…"}
            {status === "ready" && "Click below to stop receiving emails from SocialRep."}
            {status === "submitting" && "Processing…"}
            {status === "done" && "You won't receive any more emails from us."}
            {status === "already" && "This email is already unsubscribed."}
            {status === "invalid" && "This unsubscribe link is invalid or expired."}
            {status === "error" && (errorMsg || "Something went wrong. Please try again.")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          {status === "validating" || status === "submitting" ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          ) : status === "ready" ? (
            <Button onClick={handleConfirm}>Confirm unsubscribe</Button>
          ) : status === "done" || status === "already" ? (
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          ) : (
            <XCircle className="h-10 w-10 text-destructive" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
