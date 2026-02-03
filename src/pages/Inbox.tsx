import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Plus,
} from "lucide-react";
import { useInteractions } from "@/hooks/useInteractions";
import { useAIResponse } from "@/hooks/useAIResponse";
import { useRealtime } from "@/hooks/useRealtime";
import { useToast } from "@/hooks/use-toast";
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
  yelp: "bg-yellow-500",
  tripadvisor: "bg-green-600",
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
  const { toast } = useToast();
  const { interactions, loading, error, refetch, updateInteraction, createInteraction } = useInteractions();
  const { generateResponse, loading: aiLoading, error: aiError } = useAIResponse();
  
  const [selectedInteraction, setSelectedInteraction] = useState<Interaction | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [response, setResponse] = useState("");
  const [suggestedResponse, setSuggestedResponse] = useState("");

  // Real-time subscription for new interactions
  useRealtime<Interaction>({
    table: "interactions",
    onInsert: (newInteraction) => {
      toast({
        title: "New interaction",
        description: `New ${newInteraction.interaction_type} from ${newInteraction.author_name || "Unknown"}`,
      });
      refetch();
    },
    onUpdate: () => refetch(),
  });

  // Filter interactions
  const filteredInteractions = interactions.filter((interaction) => {
    if (platformFilter !== "all" && interaction.platform !== platformFilter) return false;
    if (statusFilter !== "all" && interaction.status !== statusFilter) return false;
    if (searchQuery && !interaction.content.toLowerCase().includes(searchQuery.toLowerCase()))
      return false;
    return true;
  });

  // Select first interaction when loaded
  useEffect(() => {
    if (interactions.length > 0 && !selectedInteraction) {
      setSelectedInteraction(interactions[0]);
    }
  }, [interactions, selectedInteraction]);

  const handleGenerateResponse = async () => {
    if (!selectedInteraction) return;

    const result = await generateResponse(
      selectedInteraction.content,
      selectedInteraction.platform,
      selectedInteraction.interaction_type,
      selectedInteraction.sentiment || undefined
    );

    if (result) {
      setSuggestedResponse(result.response);
      // Update sentiment in database if analyzed
      if (result.sentiment !== selectedInteraction.sentiment) {
        await updateInteraction(selectedInteraction.id, {
          sentiment: result.sentiment,
          sentiment_score: result.sentimentScore,
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
      await updateInteraction(selectedInteraction.id, {
        response: response,
        status: "responded",
        responded_at: new Date().toISOString(),
      });

      toast({
        title: "Response saved",
        description: "Your response has been saved successfully.",
      });

      setResponse("");
      setSuggestedResponse("");
      setSelectedInteraction({ ...selectedInteraction, status: "responded", response });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save response",
        variant: "destructive",
      });
    }
  };

  const handleAddMockInteraction = async () => {
    try {
      await createInteraction({
        platform: "instagram",
        interaction_type: "comment",
        content: "Just tried your product and it's amazing! The quality exceeded my expectations. Will definitely recommend to friends! 🔥",
        author_name: "Happy Customer",
        author_handle: "@happy_customer_2024",
        status: "pending",
        sentiment: "positive",
        urgency_score: 3,
      });
      toast({
        title: "Mock interaction added",
        description: "A sample interaction has been added to your inbox.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add interaction",
        variant: "destructive",
      });
    }
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
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-[calc(100vh-8rem)] flex gap-6">
          <div className="w-[400px] flex flex-col border rounded-lg bg-card p-4">
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
        <div className="w-[400px] flex flex-col border rounded-lg bg-card">
          {/* Filters */}
          <div className="p-4 border-b space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search interactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" size="icon" onClick={refetch} title="Refresh">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleAddMockInteraction} title="Add mock interaction">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" className="flex-1 flex flex-col">
            <TabsList className="mx-4 mt-2">
              <TabsTrigger value="all" className="flex-1">All ({interactions.length})</TabsTrigger>
              <TabsTrigger value="pending" className="flex-1">
                Pending ({interactions.filter((i) => i.status === "pending").length})
              </TabsTrigger>
              <TabsTrigger value="urgent" className="flex-1">
                Urgent ({interactions.filter((i) => (i.urgency_score || 0) >= 7).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="flex-1 overflow-auto p-2 m-0">
              {filteredInteractions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <p className="mb-4">No interactions yet</p>
                  <Button variant="outline" onClick={handleAddMockInteraction}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add sample interaction
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredInteractions.map((interaction) => (
                    <InteractionCard
                      key={interaction.id}
                      interaction={interaction}
                      isSelected={selectedInteraction?.id === interaction.id}
                      onClick={() => {
                        setSelectedInteraction(interaction);
                        setResponse("");
                        setSuggestedResponse("");
                      }}
                      formatTime={formatTime}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="pending" className="flex-1 overflow-auto p-2 m-0">
              <div className="space-y-2">
                {filteredInteractions
                  .filter((i) => i.status === "pending")
                  .map((interaction) => (
                    <InteractionCard
                      key={interaction.id}
                      interaction={interaction}
                      isSelected={selectedInteraction?.id === interaction.id}
                      onClick={() => {
                        setSelectedInteraction(interaction);
                        setResponse("");
                        setSuggestedResponse("");
                      }}
                      formatTime={formatTime}
                    />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="urgent" className="flex-1 overflow-auto p-2 m-0">
              <div className="space-y-2">
                {filteredInteractions
                  .filter((i) => (i.urgency_score || 0) >= 7)
                  .map((interaction) => (
                    <InteractionCard
                      key={interaction.id}
                      interaction={interaction}
                      isSelected={selectedInteraction?.id === interaction.id}
                      onClick={() => {
                        setSelectedInteraction(interaction);
                        setResponse("");
                        setSuggestedResponse("");
                      }}
                      formatTime={formatTime}
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
                      <h3 className="font-semibold">{selectedInteraction.author_name || "Unknown"}</h3>
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
                      {selectedInteraction.sentiment && sentimentIcons[selectedInteraction.sentiment] &&
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
                      {selectedInteraction.status && statusIcons[selectedInteraction.status] &&
                        (() => {
                          const Icon = statusIcons[selectedInteraction.status!];
                          return <Icon className="h-3 w-3 mr-1" />;
                        })()}
                      {selectedInteraction.status || "pending"}
                    </Badge>
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
                </div>

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

                {/* AI Suggested Response */}
                {suggestedResponse && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">AI Suggested Response</span>
                    </div>
                    <div className="p-4 rounded-lg border border-primary/20 bg-accent/50">
                      <p className="text-sm">{suggestedResponse}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={() => setResponse(suggestedResponse)}
                      >
                        Use this response
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Response Area */}
              {selectedInteraction.status !== "responded" && (
                <div className="p-6 border-t">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Your Response</span>
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
                    <Textarea
                      placeholder="Type your response..."
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      rows={4}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline">Save Draft</Button>
                      <Button variant="hero" disabled={!response} onClick={handleSendResponse}>
                        <Send className="h-4 w-4 mr-2" />
                        Send Response
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
    </DashboardLayout>
  );
}

// Extracted component for interaction cards
function InteractionCard({
  interaction,
  isSelected,
  onClick,
  formatTime,
}: {
  interaction: Interaction;
  isSelected: boolean;
  onClick: () => void;
  formatTime: (date: string) => string;
}) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg cursor-pointer transition-all ${
        isSelected
          ? "bg-accent border border-primary/20"
          : "bg-background hover:bg-muted/50 border border-transparent"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-2 h-2 rounded-full mt-2 ${
            interaction.sentiment === "positive"
              ? "bg-sentiment-positive"
              : interaction.sentiment === "negative"
              ? "bg-sentiment-negative"
              : "bg-sentiment-neutral"
          }`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`w-2 h-2 rounded-full ${
                platformColors[interaction.platform]
              }`}
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
          <p className="font-medium text-sm mb-1">{interaction.author_name || "Unknown"}</p>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {interaction.content}
          </p>
        </div>
      </div>
    </div>
  );
}
