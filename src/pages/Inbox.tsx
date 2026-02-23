import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Search,
  Sparkles,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  Archive,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  Minus,
  RefreshCw,
  Beaker,
  Loader2,
  Zap,
  StickyNote,
} from "lucide-react";
import { useInfiniteInteractions, InteractionFilters } from "@/hooks/useInfiniteInteractions";
import { useAIResponse } from "@/hooks/useAIResponse";
import { useAutomationRules } from "@/hooks/useAutomationRules";
import { useBrandVoice } from "@/hooks/useBrandVoice";
import { useAuth } from "@/hooks/useAuth";
import { useTeam } from "@/hooks/useTeam";
import { useInboxKeyboardShortcuts } from "@/hooks/useInboxKeyboardShortcuts";
import { seedSampleData } from "@/lib/sampleData";
import { useToast } from "@/hooks/use-toast";
import { AdvancedFilters } from "@/components/inbox/AdvancedFilters";
import { BulkActions } from "@/components/inbox/BulkActions";
import { AIResponseFeedback } from "@/components/inbox/AIResponseFeedback";
import { KeyboardShortcutsHelper } from "@/components/inbox/KeyboardShortcutsHelper";
import { AssignToDropdown } from "@/components/inbox/AssignToDropdown";
import { InternalNoteToggle } from "@/components/inbox/InternalNoteToggle";
import { CannedResponsesDropdown } from "@/components/inbox/CannedResponsesDropdown";
import { FloatingBulkActions } from "@/components/inbox/FloatingBulkActions";
import { CustomerHistory } from "@/components/inbox/CustomerHistory";
import { ResponseTimeIndicator } from "@/components/inbox/ResponseTimeIndicator";
import { ConvertToLeadButton } from "@/components/leads";
import { CommentActionButtons } from "@/components/streams/CommentActionButtons";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, Enums } from "@/integrations/supabase/types";

type Interaction = Tables<"interactions">;
type Sentiment = Enums<"sentiment_type">;
type Status = Enums<"interaction_status">;
type Platform = Enums<"interaction_platform">;

const platformColors: Record<Platform, string> = {
  instagram: "bg-platform-instagram",
  facebook: "bg-platform-facebook",
  twitter: "bg-platform-twitter",
  google: "bg-platform-google",
  linkedin: "bg-platform-linkedin",
  tiktok: "bg-black",
  youtube: "bg-red-600",
  yelp: "bg-yellow-500",
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

const sentimentIcons: Record<Sentiment, typeof ThumbsUp> = {
  positive: ThumbsUp,
  neutral: Minus,
  negative: ThumbsDown,
};

const statusIcons: Record<Status, typeof Clock> = {
  pending: Clock,
  responded: CheckCircle2,
  escalated: AlertCircle,
  archived: Archive,
};

export default function InboxPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { members } = useTeam();
  const {
    interactions,
    loading,
    loadingMore,
    hasMore,
    filters,
    counts,
    pendingRealtimeCount,
    refetch,
    loadMore,
    updateInteraction,
    bulkUpdateInteractions,
    bulkDeleteInteractions,
    applyFilters,
    refetchWithFilters,
    forceRealtimeFlush,
  } = useInfiniteInteractions();
  const { generateResponse, loading: aiLoading, error: aiError } = useAIResponse();
  const { evaluateRules, rules } = useAutomationRules();
  const { getBrandContext } = useBrandVoice();

  const [selectedInteraction, setSelectedInteraction] = useState<Interaction | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [response, setResponse] = useState("");
  const [suggestedResponse, setSuggestedResponse] = useState("");
  const [responseConfidence, setResponseConfidence] = useState<number | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [matchedRules, setMatchedRules] = useState<string[]>([]);
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  // Quick search filter (local) - uses useMemo for large datasets
  const displayedInteractions = useMemo(() => {
    if (!searchQuery) return interactions;
    const query = searchQuery.toLowerCase();
    return interactions.filter((i) =>
      i.content.toLowerCase().includes(query) ||
      i.author_name?.toLowerCase().includes(query)
    );
  }, [interactions, searchQuery]);

  // Keyboard shortcuts
  const handleSelectInteraction = useCallback((id: string) => {
    const interaction = interactions.find((i) => i.id === id);
    if (interaction) {
      setSelectedInteraction(interaction);
      setResponse("");
      setSuggestedResponse("");
      setResponseConfidence(null);
      setMatchedRules([]);
    }
  }, [interactions]);

  const handleResolve = useCallback(async () => {
    if (!selectedInteraction) return;
    try {
      await updateInteraction(selectedInteraction.id, {
        resolved: true,
        status: "responded",
        responded_at: new Date().toISOString(),
      });
      toast({ title: "Marked as resolved" });
      setSelectedInteraction({ ...selectedInteraction, resolved: true, status: "responded" });
    } catch {
      toast({ title: "Error", description: "Failed to resolve", variant: "destructive" });
    }
  }, [selectedInteraction, updateInteraction, toast]);

  const handleFocusReply = useCallback(() => {
    replyInputRef.current?.focus();
  }, []);

  const handleOpenAssign = useCallback(() => {
    setShowAssignDropdown(true);
  }, []);

  const { showHelp, setShowHelp } = useInboxKeyboardShortcuts({
    interactions: displayedInteractions,
    selectedId: selectedInteraction?.id || null,
    onSelect: handleSelectInteraction,
    onResolve: handleResolve,
    onFocusReply: handleFocusReply,
    onOpenAssign: handleOpenAssign,
    enabled: !loading,
  });

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!listRef.current || loadingMore || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      loadMore();
    }
  }, [loadMore, loadingMore, hasMore]);

  // Select first interaction when loaded
  useEffect(() => {
    if (interactions.length > 0 && !selectedInteraction) {
      setSelectedInteraction(interactions[0]);
    }
  }, [interactions, selectedInteraction]);

  // Refetch when filters change
  useEffect(() => {
    refetchWithFilters();
  }, [filters, refetchWithFilters]);

  const handleLoadSampleData = async () => {
    if (!user) return;
    setSeeding(true);
    try {
      const result = await seedSampleData(user.id);
      if (result.success) {
        toast({
          title: "Sample data loaded",
          description: "Your inbox has been populated with sample interactions.",
        });
        refetch();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load sample data",
        variant: "destructive",
      });
    } finally {
      setSeeding(false);
    }
  };

  const handleGenerateResponse = async () => {
    if (!selectedInteraction) return;

    const brandContext = getBrandContext();

    const result = await generateResponse(
      selectedInteraction.content,
      selectedInteraction.platform,
      selectedInteraction.interaction_type,
      selectedInteraction.sentiment || undefined
    );

    if (result) {
      setSuggestedResponse(result.response);
      setResponseConfidence((result as any).responseConfidence || 0.7);
      
      if (result.sentiment !== selectedInteraction.sentiment) {
        await updateInteraction(selectedInteraction.id, {
          sentiment: result.sentiment,
          sentiment_score: result.sentimentScore,
        });
      }

      // Check automation rules
      const matched = await evaluateRules({
        sentiment: result.sentiment,
        sentiment_score: result.sentimentScore,
        platform: selectedInteraction.platform,
        content: selectedInteraction.content,
      });

      if (matched.length > 0) {
        setMatchedRules(matched.map((r) => r.name));
        toast({
          title: "Automation rules matched",
          description: `${matched.length} rule(s) apply to this interaction`,
        });
      }
    } else if (aiError) {
      toast({
        title: "AI Error",
        description: aiError,
        variant: "destructive",
      });
    }
  };

  const handleSendResponse = async () => {
    if (!selectedInteraction || !response) return;

    try {
      const platform = selectedInteraction.platform;
      const shouldSendToPlatform =
        !isInternalNote && (platform === "facebook" || platform === "instagram");

      if (shouldSendToPlatform) {
        const { data, error } = await supabase.functions.invoke("send-platform-reply", {
          body: {
            interactionId: selectedInteraction.id,
            content: response,
            platform,
          },
        });

        if (error || (data && !data.success && !data.notConnected)) {
          // Platform send failed — save locally anyway
          await updateInteraction(selectedInteraction.id, {
            response,
            status: "responded",
            responded_at: new Date().toISOString(),
          });
          toast({
            title: "Reply saved locally",
            description: data?.error || error?.message || "Could not send to platform, but reply was saved.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Reply sent!",
            description: data?.notConnected
              ? "Reply saved locally. Platform not connected."
              : "Your reply was posted to the platform.",
          });
        }
      } else {
        await updateInteraction(selectedInteraction.id, {
          response,
          status: "responded",
          responded_at: new Date().toISOString(),
        });
        toast({
          title: isInternalNote ? "Internal note saved" : "Response saved",
          description: isInternalNote
            ? "Your internal note has been saved."
            : "Your response has been saved successfully.",
        });
      }

      setResponse("");
      setSuggestedResponse("");
      setResponseConfidence(null);
      setMatchedRules([]);
      setIsInternalNote(false);
      setSelectedInteraction({ ...selectedInteraction, status: "responded", response });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save response",
        variant: "destructive",
      });
    }
  };

  // Assign interaction
  const handleAssign = async (userId: string | null) => {
    if (!selectedInteraction) return;
    await updateInteraction(selectedInteraction.id, { assigned_to: userId });
    setSelectedInteraction({ ...selectedInteraction, assigned_to: userId });
    toast({ 
      title: userId ? "Assigned" : "Unassigned",
      description: userId ? "Interaction assigned to team member" : "Interaction unassigned",
    });
  };

  // Bulk actions
  const handleSelectAll = () => {
    setSelectedIds(new Set(displayedInteractions.map((i) => i.id)));
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleBulkArchive = async () => {
    try {
      await bulkUpdateInteractions(Array.from(selectedIds), { status: "archived" });
      toast({ title: "Archived", description: `${selectedIds.size} interactions archived` });
      setSelectedIds(new Set());
    } catch {
      toast({ title: "Error", description: "Failed to archive", variant: "destructive" });
    }
  };

  const handleBulkEscalate = async () => {
    try {
      await bulkUpdateInteractions(Array.from(selectedIds), { status: "escalated" });
      toast({ title: "Escalated", description: `${selectedIds.size} interactions escalated` });
      setSelectedIds(new Set());
    } catch {
      toast({ title: "Error", description: "Failed to escalate", variant: "destructive" });
    }
  };

  const handleBulkMarkResponded = async () => {
    try {
      await bulkUpdateInteractions(Array.from(selectedIds), { 
        status: "responded",
        responded_at: new Date().toISOString(),
      });
      toast({ title: "Updated", description: `${selectedIds.size} interactions marked as responded` });
      setSelectedIds(new Set());
    } catch {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  const handleBulkMarkResolved = async () => {
    try {
      await bulkUpdateInteractions(Array.from(selectedIds), { 
        resolved: true,
        status: "responded",
        responded_at: new Date().toISOString(),
      });
      toast({ title: "Resolved", description: `${selectedIds.size} interactions marked as resolved` });
      setSelectedIds(new Set());
    } catch {
      toast({ title: "Error", description: "Failed to resolve", variant: "destructive" });
    }
  };

  const handleBulkAssign = async (userId: string | null) => {
    try {
      await bulkUpdateInteractions(Array.from(selectedIds), { assigned_to: userId });
      toast({ title: "Assigned", description: `${selectedIds.size} interactions assigned` });
      setSelectedIds(new Set());
    } catch {
      toast({ title: "Error", description: "Failed to assign", variant: "destructive" });
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteInteractions(Array.from(selectedIds));
      toast({ title: "Deleted", description: `${selectedIds.size} interactions deleted` });
      setSelectedIds(new Set());
      setSelectedInteraction(null);
    } catch {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const getSentimentColor = (sentiment: Sentiment | null) => {
    switch (sentiment) {
      case "positive":
        return "text-sentiment-positive bg-sentiment-positive/10";
      case "negative":
        return "text-sentiment-negative bg-sentiment-negative/10";
      default:
        return "text-sentiment-neutral bg-sentiment-neutral/10";
    }
  };

  const getStatusColor = (status: Status | null) => {
    switch (status) {
      case "pending":
        return "text-sentiment-neutral bg-sentiment-neutral/10";
      case "responded":
        return "text-sentiment-positive bg-sentiment-positive/10";
      case "escalated":
        return "text-sentiment-negative bg-sentiment-negative/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Get assigned member info
  const getAssignedMember = (assignedTo: string | null) => {
    if (!assignedTo) return null;
    return members.find((m) => m.user_id === assignedTo);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-[calc(100vh-8rem)] flex gap-6">
          <div className="w-[420px] flex flex-col border rounded-lg bg-card p-4">
            <Skeleton className="h-10 w-full mb-3" />
            <div className="flex gap-2 mb-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
            </div>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full mb-2" />
            ))}
          </div>
          <div className="flex-1 border rounded-lg bg-card p-6">
            <Skeleton className="h-16 w-full mb-6" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex gap-6">
        {/* Interactions List */}
        <div className="w-[420px] flex flex-col border rounded-lg bg-card">
          {/* Filters Bar */}
          <div className="p-4 border-b space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Quick search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <AdvancedFilters
                filters={filters}
                onFiltersChange={applyFilters}
                onApply={refetchWithFilters}
              />
              <Button variant="outline" size="icon" onClick={refetch} title="Refresh">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleLoadSampleData}
                disabled={seeding}
                title="Load sample data"
              >
                <Beaker className={`h-4 w-4 ${seeding ? "animate-pulse" : ""}`} />
              </Button>
              <KeyboardShortcutsHelper
                showDialog={showHelp}
                onDialogChange={setShowHelp}
              />
            </div>

            {/* Bulk Actions (in header) */}
            <BulkActions
              selectedCount={selectedIds.size}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              onBulkArchive={handleBulkArchive}
              onBulkEscalate={handleBulkEscalate}
              onBulkMarkResponded={handleBulkMarkResponded}
              onBulkDelete={handleBulkDelete}
            />

            {/* Scaling Stats & Status Indicators */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-3">
                {/* Active Rules */}
                {rules.filter((r) => r.is_active).length > 0 && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Zap className="h-3 w-3 text-primary" />
                    <span>{rules.filter((r) => r.is_active).length} rules</span>
                  </div>
                )}
                
                {/* Realtime Updates Pending */}
                {pendingRealtimeCount > 0 && (
                  <button
                    onClick={forceRealtimeFlush}
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <RefreshCw className="h-3 w-3 animate-pulse" />
                    <span>{pendingRealtimeCount} incoming</span>
                  </button>
                )}
              </div>

              {/* Volume Stats */}
              {counts.total > 100 && (
                <div className="text-muted-foreground">
                  {counts.loaded.toLocaleString()} / {counts.total.toLocaleString()} loaded
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" className="flex-1 flex flex-col">
            <TabsList className="mx-4 mt-2">
              <TabsTrigger value="all" className="flex-1">
                All ({counts.total > 0 ? counts.total.toLocaleString() : interactions.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex-1">
                Pending ({counts.pending.toLocaleString()})
              </TabsTrigger>
              <TabsTrigger value="urgent" className="flex-1">
                Urgent ({counts.urgent.toLocaleString()})
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="all"
              className="flex-1 overflow-auto p-2 m-0"
              ref={listRef}
              onScroll={handleScroll}
            >
              {displayedInteractions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Beaker className="h-10 w-10 mb-3 opacity-50" />
                  <p className="mb-4">No interactions yet</p>
                  <Button variant="outline" onClick={handleLoadSampleData} disabled={seeding}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Load Sample Data
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {displayedInteractions.map((interaction) => (
                    <InteractionCard
                      key={interaction.id}
                      interaction={interaction}
                      isSelected={selectedInteraction?.id === interaction.id}
                      isChecked={selectedIds.has(interaction.id)}
                      onCheck={() => toggleSelection(interaction.id)}
                      onClick={() => {
                        setSelectedInteraction(interaction);
                        setResponse("");
                        setSuggestedResponse("");
                        setResponseConfidence(null);
                        setMatchedRules([]);
                      }}
                      formatTime={formatTime}
                      assignedMember={getAssignedMember(interaction.assigned_to)}
                    />
                  ))}
                  {loadingMore && (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  {!hasMore && interactions.length > 0 && (
                    <p className="text-center text-xs text-muted-foreground py-2">
                      All {interactions.length} interactions loaded
                    </p>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent
              value="pending"
              className="flex-1 overflow-auto p-2 m-0"
            >
              <div className="space-y-2">
                {displayedInteractions
                  .filter((i) => i.status === "pending")
                  .map((interaction) => (
                    <InteractionCard
                      key={interaction.id}
                      interaction={interaction}
                      isSelected={selectedInteraction?.id === interaction.id}
                      isChecked={selectedIds.has(interaction.id)}
                      onCheck={() => toggleSelection(interaction.id)}
                      onClick={() => {
                        setSelectedInteraction(interaction);
                        setResponse("");
                        setSuggestedResponse("");
                        setResponseConfidence(null);
                        setMatchedRules([]);
                      }}
                      formatTime={formatTime}
                      assignedMember={getAssignedMember(interaction.assigned_to)}
                    />
                  ))}
              </div>
            </TabsContent>

            <TabsContent
              value="urgent"
              className="flex-1 overflow-auto p-2 m-0"
            >
              <div className="space-y-2">
                {displayedInteractions
                  .filter((i) => (i.urgency_score || 0) >= 7)
                  .map((interaction) => (
                    <InteractionCard
                      key={interaction.id}
                      interaction={interaction}
                      isSelected={selectedInteraction?.id === interaction.id}
                      isChecked={selectedIds.has(interaction.id)}
                      onCheck={() => toggleSelection(interaction.id)}
                      onClick={() => {
                        setSelectedInteraction(interaction);
                        setResponse("");
                        setSuggestedResponse("");
                        setResponseConfidence(null);
                        setMatchedRules([]);
                      }}
                      formatTime={formatTime}
                      assignedMember={getAssignedMember(interaction.assigned_to)}
                    />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Detail Panel */}
        <div className="flex-1 flex flex-col border rounded-lg bg-card">
          {selectedInteraction ? (
            <>
              {/* Header */}
              <div className="p-6 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-lg font-semibold">
                      {(selectedInteraction.author_name || "U")[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {selectedInteraction.author_name || "Unknown"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedInteraction.author_handle || "No handle"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={getSentimentColor(selectedInteraction.sentiment)}
                      variant="secondary"
                    >
                      {selectedInteraction.sentiment &&
                        sentimentIcons[selectedInteraction.sentiment] &&
                        (() => {
                          const Icon = sentimentIcons[selectedInteraction.sentiment!];
                          return <Icon className="h-3 w-3 mr-1" />;
                        })()}
                      {selectedInteraction.sentiment || "unknown"}
                    </Badge>
                    <Badge
                      className={getStatusColor(selectedInteraction.status)}
                      variant="secondary"
                    >
                      {selectedInteraction.status &&
                        statusIcons[selectedInteraction.status] &&
                        (() => {
                          const Icon = statusIcons[selectedInteraction.status!];
                          return <Icon className="h-3 w-3 mr-1" />;
                        })()}
                      {selectedInteraction.status || "pending"}
                    </Badge>
                    <AssignToDropdown
                      assignedTo={selectedInteraction.assigned_to}
                      onAssign={handleAssign}
                      open={showAssignDropdown}
                      onOpenChange={setShowAssignDropdown}
                    />
                    <ConvertToLeadButton interaction={selectedInteraction} />
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 overflow-auto">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        platformColors[selectedInteraction.platform]
                      }`}
                    />
                    <span className="text-sm font-medium capitalize">
                      {selectedInteraction.platform} {selectedInteraction.interaction_type}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      • {formatTime(selectedInteraction.created_at)}
                    </span>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-base">{selectedInteraction.content}</p>
                  </div>

                  {/* Comment Action Buttons */}
                  {(selectedInteraction.interaction_type === "comment" ||
                    selectedInteraction.interaction_type === "mention" ||
                    selectedInteraction.interaction_type === "review") && (
                    <CommentActionButtons
                      platform={selectedInteraction.platform}
                      authorName={selectedInteraction.author_name}
                      isHidden={(selectedInteraction.metadata as any)?.hidden === true}
                      onReply={() => replyInputRef.current?.focus()}
                      onHide={() =>
                        updateInteraction(selectedInteraction.id, {
                          metadata: { ...(selectedInteraction.metadata as any), hidden: true },
                        }).then(() =>
                          setSelectedInteraction({
                            ...selectedInteraction,
                            metadata: { ...(selectedInteraction.metadata as any), hidden: true },
                          })
                        )
                      }
                      onUnhide={() =>
                        updateInteraction(selectedInteraction.id, {
                          metadata: { ...(selectedInteraction.metadata as any), hidden: false },
                        }).then(() =>
                          setSelectedInteraction({
                            ...selectedInteraction,
                            metadata: { ...(selectedInteraction.metadata as any), hidden: false },
                          })
                        )
                      }
                      onSendPM={(message) => {
                        toast({
                          title: "Private message queued",
                          description: `Message to ${selectedInteraction.author_name || "user"} will be sent via ${selectedInteraction.platform}.`,
                        });
                      }}
                      onDelete={async () => {
                        try {
                          await updateInteraction(selectedInteraction.id, { status: "archived" });
                          setSelectedInteraction({
                            ...selectedInteraction,
                            status: "archived",
                          });
                        } catch {
                          toast({
                            title: "Error",
                            description: "Failed to delete comment",
                            variant: "destructive",
                          });
                        }
                      }}
                      className="mt-3"
                    />
                  )}

                  {/* Response Time Indicator */}
                  <ResponseTimeIndicator
                    createdAt={selectedInteraction.created_at}
                    respondedAt={selectedInteraction.responded_at}
                    status={selectedInteraction.status}
                    className="mt-2"
                  />
                </div>

                {/* Matched Rules */}
                {matchedRules.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Automation Rules Matched</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {matchedRules.map((rule) => (
                        <Badge key={rule} variant="secondary">
                          {rule}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Previous Response */}
                {selectedInteraction.response && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="h-4 w-4 text-sentiment-positive" />
                      <span className="text-sm font-medium">Your Response</span>
                    </div>
                    <div className="p-4 rounded-lg border border-sentiment-positive/20 bg-sentiment-positive/5">
                      <p className="text-sm">{selectedInteraction.response}</p>
                    </div>
                  </div>
                )}

                {/* AI Suggested Response with Confidence */}
                {suggestedResponse && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">AI Suggested Response</span>
                      </div>
                      {responseConfidence !== null && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Confidence</span>
                              <Progress
                                value={responseConfidence * 100}
                                className="w-20 h-2"
                              />
                              <span className="text-xs font-medium">
                                {Math.round(responseConfidence * 100)}%
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Higher confidence with more brand voice training data</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <div className="p-4 rounded-lg border border-primary/20 bg-accent/50">
                      <p className="text-sm mb-4">{suggestedResponse}</p>
                      <AIResponseFeedback
                        interactionId={selectedInteraction.id}
                        aiResponse={suggestedResponse}
                        onAccept={(finalResponse) => {
                          setResponse(finalResponse);
                          setSuggestedResponse("");
                        }}
                        onReject={() => {
                          setSuggestedResponse("");
                          toast({
                            title: "Response rejected",
                            description: "Try generating a new response or write your own.",
                          });
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Customer History */}
                <CustomerHistory
                  currentInteractionId={selectedInteraction.id}
                  authorHandle={selectedInteraction.author_handle}
                  authorName={selectedInteraction.author_name}
                  onSelectInteraction={(interaction) => {
                    setSelectedInteraction(interaction);
                    setResponse("");
                    setSuggestedResponse("");
                    setResponseConfidence(null);
                    setMatchedRules([]);
                  }}
                />
              </div>

              {/* Response Area */}
              {selectedInteraction.status !== "responded" && (
                <div className="p-6 border-t">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <InternalNoteToggle
                        isInternal={isInternalNote}
                        onToggle={setIsInternalNote}
                      />
                      <div className="flex items-center gap-2">
                        <CannedResponsesDropdown
                          onSelect={(template) => setResponse(template)}
                          disabled={aiLoading}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleGenerateResponse}
                          disabled={aiLoading}
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          {aiLoading ? "Generating..." : "Generate with AI"}
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      ref={replyInputRef}
                      placeholder={isInternalNote ? "Write an internal note..." : "Type your response..."}
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      rows={4}
                      className={cn(
                        isInternalNote && "border-accent bg-accent/30"
                      )}
                    />
                    {isInternalNote && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <StickyNote className="h-3.5 w-3.5" />
                        Internal notes are only visible to your team
                      </div>
                    )}
                    <div className="flex justify-end gap-2">
                      <Button variant="outline">Save Draft</Button>
                      <Button
                        variant="hero"
                        disabled={!response}
                        onClick={handleSendResponse}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {isInternalNote ? "Save Note" : "Send Response"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select an interaction to view details
            </div>
          )}
        </div>
      </div>

      {/* Floating Bulk Actions */}
      <FloatingBulkActions
        selectedCount={selectedIds.size}
        onMarkResolved={handleBulkMarkResolved}
        onArchive={handleBulkArchive}
        onAssign={handleBulkAssign}
        onClear={handleDeselectAll}
      />
    </DashboardLayout>
  );
}

interface InteractionCardProps {
  interaction: Interaction;
  isSelected: boolean;
  isChecked: boolean;
  onCheck: () => void;
  onClick: () => void;
  formatTime: (date: string) => string;
  assignedMember?: { user_id: string; full_name?: string; email?: string; avatar_url?: string } | null;
}

function InteractionCard({
  interaction,
  isSelected,
  isChecked,
  onCheck,
  onClick,
  formatTime,
  assignedMember,
}: InteractionCardProps) {
  return (
    <div
      className={`p-4 rounded-lg cursor-pointer transition-all ${
        isSelected
          ? "bg-accent border border-primary/20"
          : "bg-background hover:bg-muted/50 border border-transparent"
      }`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isChecked}
          onCheckedChange={onCheck}
          onClick={(e) => e.stopPropagation()}
          className="mt-1"
        />
        <div
          onClick={onClick}
          className="flex-1 min-w-0"
        >
          <div className="flex items-center gap-2 mb-1">
            {/* Sentiment dot */}
            <span
              className={`w-2 h-2 rounded-full ${
                interaction.sentiment === "positive"
                  ? "bg-sentiment-positive"
                  : interaction.sentiment === "negative"
                  ? "bg-sentiment-negative"
                  : "bg-sentiment-neutral"
              }`}
            />
            {/* Platform dot */}
            <span
              className={`w-2 h-2 rounded-full ${platformColors[interaction.platform]}`}
            />
            <span className="text-xs text-muted-foreground capitalize">
              {interaction.platform}
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">
              {formatTime(interaction.created_at)}
            </span>
            {(interaction.urgency_score || 0) >= 8 && (
              <Badge variant="destructive" className="ml-auto text-xs py-0">
                Urgent
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-sm">
              {interaction.author_name || "Unknown"}
            </p>
            {/* Assigned member avatar */}
            {assignedMember && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={assignedMember.avatar_url || ""} />
                    <AvatarFallback className="text-[8px]">
                      {(assignedMember.full_name || assignedMember.email || "U")[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  Assigned to {assignedMember.full_name || assignedMember.email}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {interaction.content}
          </p>
        </div>
      </div>
    </div>
  );
}
