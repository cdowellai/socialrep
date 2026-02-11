import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function MetaCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "selecting" | "connecting" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [pages, setPages] = useState<any[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [userToken, setUserToken] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      setStatus("error");
      setErrorMessage(searchParams.get("error_description") || "Authorization was denied.");
      return;
    }

    if (!code) {
      setStatus("error");
      setErrorMessage("No authorization code received.");
      return;
    }

    exchangeCode(code);
  }, [searchParams]);

  const exchangeCode = async (code: string) => {
    try {
      const redirectUri = `${window.location.origin}/auth/meta/callback`;

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setStatus("error");
        setErrorMessage("You must be logged in to connect Meta accounts.");
        return;
      }

      const { data, error } = await supabase.functions.invoke("meta-oauth", {
        body: { action: "exchange_code", code, redirect_uri: redirectUri },
      });

      if (error || !data?.success) {
        throw new Error(data?.error || error?.message || "Failed to exchange code");
      }

      setUserToken(data.user_token);

      if (data.pages && data.pages.length > 0) {
        setPages(data.pages);
        // Select all by default
        setSelectedPages(new Set(data.pages.map((p: any) => p.id)));
        setStatus("selecting");
      } else {
        setStatus("error");
        setErrorMessage("No Facebook Pages found on your account. Make sure you manage at least one Page.");
      }
    } catch (err: any) {
      console.error("Meta OAuth error:", err);
      setStatus("error");
      setErrorMessage(err.message || "Failed to complete authorization.");
    }
  };

  const handleConnectPages = async () => {
    setStatus("connecting");
    try {
      const selectedPageData = pages
        .filter((p) => selectedPages.has(p.id))
        .map((p) => ({
          id: p.id,
          name: p.name,
          access_token: p.access_token,
          instagram_business_account_id: p.instagram_business_account || null,
        }));

      const { data, error } = await supabase.functions.invoke("meta-oauth", {
        body: { action: "connect_pages", pages: selectedPageData, user_token: userToken },
      });

      if (error || !data?.success) {
        throw new Error(data?.error || error?.message || "Failed to connect pages");
      }

      setStatus("success");
      setTimeout(() => navigate("/dashboard/settings?tab=platforms"), 2000);
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "Failed to connect selected pages.");
    }
  };

  const togglePage = (pageId: string) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageId)) next.delete(pageId);
      else next.add(pageId);
      return next;
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-lg w-full bg-card rounded-xl border shadow-lg p-8">
        {status === "loading" && (
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <h2 className="text-xl font-semibold">Connecting to Meta...</h2>
            <p className="text-muted-foreground">Exchanging authorization code for access tokens.</p>
          </div>
        )}

        {status === "selecting" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold">Select Pages to Connect</h2>
              <p className="text-muted-foreground mt-1">
                Choose which Facebook Pages (and linked Instagram accounts) to monitor.
              </p>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {pages.map((page) => (
                <label
                  key={page.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedPages.has(page.id) ? "border-primary bg-primary/5" : "hover:bg-accent/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPages.has(page.id)}
                    onChange={() => togglePage(page.id)}
                    className="h-4 w-4 rounded border-input"
                  />
                  <div className="flex items-center gap-3 flex-1">
                    {page.picture_url && (
                      <img
                        src={page.picture_url}
                        alt={page.name}
                        className="h-10 w-10 rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-medium">{page.name}</p>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>Facebook Page</span>
                        {page.instagram_business_account && (
                          <span className="text-pink-500">+ Instagram</span>
                        )}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/dashboard/settings?tab=platforms")}
                className="flex-1 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConnectPages}
                disabled={selectedPages.size === 0}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Connect {selectedPages.size} Page{selectedPages.size !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        )}

        {status === "connecting" && (
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <h2 className="text-xl font-semibold">Connecting Pages...</h2>
            <p className="text-muted-foreground">Storing tokens and fetching Instagram accounts.</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <h2 className="text-xl font-semibold">Connected Successfully!</h2>
            <p className="text-muted-foreground">Redirecting to settings...</p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center space-y-4">
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-semibold">Connection Failed</h2>
            <p className="text-muted-foreground">{errorMessage}</p>
            <button
              onClick={() => navigate("/dashboard/settings?tab=platforms")}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Back to Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
