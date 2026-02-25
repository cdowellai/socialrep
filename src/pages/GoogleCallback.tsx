import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "selecting" | "connecting" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(new Set());
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const state = searchParams.get("state");

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

    if (state !== "google_business") {
      setStatus("error");
      setErrorMessage("Invalid state parameter. Please try connecting again.");
      return;
    }

    exchangeCode(code);
  }, [searchParams]);

  const exchangeCode = async (code: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setStatus("error");
        setErrorMessage("You must be logged in to connect Google Business.");
        return;
      }

      const redirectUri = `${window.location.origin}/auth/google/callback`;

      const { data, error } = await supabase.functions.invoke("google-oauth", {
        body: { action: "exchange_code", code, redirect_uri: redirectUri },
      });

      if (error || !data?.success) {
        throw new Error(data?.error || error?.message || "Failed to exchange code");
      }

      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token || "");

      if (data.locations && data.locations.length > 0) {
        setLocations(data.locations);
        setSelectedLocations(new Set(data.locations.map((l: any) => l.location_id || l.location_name)));
        setStatus("selecting");
      } else {
        setStatus("error");
        setErrorMessage(
          "No Google Business locations found on your account. Make sure you have a Google Business Profile set up."
        );
      }
    } catch (err: any) {
      console.error("Google OAuth error:", err);
      setStatus("error");
      setErrorMessage(err.message || "Failed to complete Google authorization.");
    }
  };

  const handleConnectLocations = async () => {
    setStatus("connecting");
    try {
      const selectedLocationData = locations.filter(
        (l) => selectedLocations.has(l.location_id || l.location_name)
      );

      const { data, error } = await supabase.functions.invoke("google-oauth", {
        body: {
          action: "connect_locations",
          locations: selectedLocationData,
          access_token: accessToken,
          refresh_token: refreshToken,
        },
      });

      if (error || !data?.success) {
        throw new Error(data?.error || error?.message || "Failed to connect locations");
      }

      // Trigger initial sync
      await supabase.functions.invoke("google-oauth", {
        body: { action: "sync_reviews" },
      });

      setStatus("success");
      setTimeout(() => navigate("/dashboard/settings?tab=platforms"), 2000);
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "Failed to connect selected locations.");
    }
  };

  const toggleLocation = (locationId: string) => {
    setSelectedLocations((prev) => {
      const next = new Set(prev);
      if (next.has(locationId)) next.delete(locationId);
      else next.add(locationId);
      return next;
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-lg w-full bg-card rounded-xl border shadow-lg p-8">
        {status === "loading" && (
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <h2 className="text-xl font-semibold">Connecting to Google Business...</h2>
            <p className="text-muted-foreground">Exchanging authorization code for access tokens.</p>
          </div>
        )}

        {status === "selecting" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold">Select Business Locations</h2>
              <p className="text-muted-foreground mt-1">
                Choose which Google Business locations to monitor for reviews.
              </p>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {locations.map((loc) => {
                const locId = loc.location_id || loc.location_name;
                return (
                  <label
                    key={locId}
                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedLocations.has(locId) ? "border-primary bg-primary/5" : "hover:bg-accent/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedLocations.has(locId)}
                      onChange={() => toggleLocation(locId)}
                      className="h-4 w-4 rounded border-input"
                    />
                    <div>
                      <p className="font-medium">{loc.location_title || "Business Location"}</p>
                      <p className="text-xs text-muted-foreground">{loc.account_display_name}</p>
                    </div>
                  </label>
                );
              })}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/dashboard/settings?tab=platforms")}
                className="flex-1 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConnectLocations}
                disabled={selectedLocations.size === 0}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Connect {selectedLocations.size} Location{selectedLocations.size !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        )}

        {status === "connecting" && (
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <h2 className="text-xl font-semibold">Connecting Locations...</h2>
            <p className="text-muted-foreground">Storing tokens and syncing your first batch of reviews.</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <h2 className="text-xl font-semibold">Google Business Connected!</h2>
            <p className="text-muted-foreground">Reviews are being synced. Redirecting to settings...</p>
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
