import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, History, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

type Interaction = Tables<"interactions">;

interface CustomerHistoryProps {
  currentInteractionId: string;
  authorHandle: string | null;
  authorName: string | null;
  onSelectInteraction?: (interaction: Interaction) => void;
}

export function CustomerHistory({
  currentInteractionId,
  authorHandle,
  authorName,
  onSelectInteraction,
}: CustomerHistoryProps) {
  const { user } = useAuth();
  const [history, setHistory] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen || !user || (!authorHandle && !authorName)) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("interactions")
          .select("*")
          .eq("user_id", user.id)
          .neq("id", currentInteractionId)
          .order("created_at", { ascending: false })
          .limit(10);

        // Match by handle or name
        if (authorHandle) {
          query = query.eq("author_handle", authorHandle);
        } else if (authorName) {
          query = query.eq("author_name", authorName);
        }

        const { data, error } = await query;
        if (error) throw error;
        setHistory(data || []);
      } catch (error) {
        console.error("Error fetching customer history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [isOpen, user, authorHandle, authorName, currentInteractionId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  };

  if (!authorHandle && !authorName) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-6">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between p-4 h-auto rounded-lg border bg-muted/30 hover:bg-muted/50"
        >
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Previous Interactions</span>
            {!isOpen && history.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {history.length}
              </Badge>
            )}
          </div>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground">
            No previous interactions found
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((interaction) => (
              <button
                key={interaction.id}
                onClick={() => onSelectInteraction?.(interaction)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-colors",
                  "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs capitalize">
                      {interaction.platform}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        interaction.sentiment === "positive" && "text-sentiment-positive",
                        interaction.sentiment === "negative" && "text-sentiment-negative"
                      )}
                    >
                      {interaction.sentiment || "neutral"}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        interaction.status === "responded" && "text-sentiment-positive",
                        interaction.status === "escalated" && "text-sentiment-negative"
                      )}
                    >
                      {interaction.status || "pending"}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(interaction.created_at)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {interaction.content}
                </p>
                {interaction.response && (
                  <p className="text-xs text-primary mt-1 line-clamp-1">
                    ↳ {interaction.response}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
