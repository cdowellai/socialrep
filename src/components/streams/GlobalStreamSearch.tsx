import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  X,
  Loader2,
  MessageSquare,
  Star,
  AtSign,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tables, Enums } from "@/integrations/supabase/types";

type Interaction = Tables<"interactions">;
type Platform = Enums<"interaction_platform">;

interface GlobalStreamSearchProps {
  onSelectInteraction?: (interaction: Interaction) => void;
}

const typeIcons: Record<string, typeof MessageSquare> = {
  comment: MessageSquare,
  dm: Mail,
  review: Star,
  mention: AtSign,
  post: MessageSquare,
};

const platformColors: Record<Platform, string> = {
  instagram: "bg-gradient-to-r from-purple-500 to-pink-500",
  facebook: "bg-blue-600",
  twitter: "bg-sky-500",
  google: "bg-red-500",
  linkedin: "bg-blue-700",
  yelp: "bg-red-600",
  tripadvisor: "bg-green-600",
  trustpilot: "bg-emerald-500",
  g2: "bg-orange-500",
  capterra: "bg-blue-600",
  bbb: "bg-blue-800",
  glassdoor: "bg-green-500",
  amazon: "bg-yellow-500",
  appstore: "bg-gray-800",
  playstore: "bg-green-600",
  other: "bg-gray-500",
};

export function GlobalStreamSearch({
  onSelectInteraction,
}: GlobalStreamSearchProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const searchInteractions = useCallback(
    async (searchQuery: string) => {
      if (!user || !searchQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("interactions")
          .select("*")
          .eq("user_id", user.id)
          .or(
            `content.ilike.%${searchQuery}%,author_name.ilike.%${searchQuery}%,author_handle.ilike.%${searchQuery}%`
          )
          .order("urgency_score", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) throw error;
        setResults(data || []);
      } catch (error) {
        console.error("Error searching interactions:", error);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim()) {
      debounceRef.current = setTimeout(() => {
        searchInteractions(query);
      }, 300);
    } else {
      setResults([]);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, searchInteractions]);

  const handleSelect = (interaction: Interaction) => {
    onSelectInteraction?.(interaction);
    setIsOpen(false);
    setQuery("");
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <Button
        variant="outline"
        className="w-full sm:w-64 justify-start text-muted-foreground"
        onClick={() => setIsOpen(true)}
      >
        <Search className="h-4 w-4 mr-2" />
        <span className="flex-1 text-left">Search all streams...</span>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-2 border-b">
            <DialogTitle className="sr-only">Search Streams</DialogTitle>
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search interactions across all streams..."
                className="border-0 focus-visible:ring-0 px-0 text-base"
                autoComplete="off"
              />
              {query && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : results.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                {query ? (
                  <p>No results found for "{query}"</p>
                ) : (
                  <p>Start typing to search across all streams</p>
                )}
              </div>
            ) : (
              <div className="py-2">
                {results.map((interaction) => {
                  const TypeIcon = typeIcons[interaction.interaction_type] || MessageSquare;
                  const isUrgent = (interaction.urgency_score || 0) >= 7;

                  return (
                    <button
                      key={interaction.id}
                      onClick={() => handleSelect(interaction)}
                      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                    >
                      <div
                        className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white",
                          platformColors[interaction.platform]
                        )}
                      >
                        <TypeIcon className="h-4 w-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-medium text-sm truncate">
                            {interaction.author_name ||
                              interaction.author_handle ||
                              "Unknown"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(interaction.created_at)}
                          </span>
                          {isUrgent && (
                            <Badge variant="destructive" className="text-[10px] px-1.5">
                              Urgent
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {interaction.content}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-[10px]">
                            {interaction.platform}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {interaction.interaction_type}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          <div className="px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
            <span>
              Press <kbd className="px-1 py-0.5 rounded bg-muted">↵</kbd> to select,{" "}
              <kbd className="px-1 py-0.5 rounded bg-muted">ESC</kbd> to close
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
