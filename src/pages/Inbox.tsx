import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
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
} from "lucide-react";

type Sentiment = "positive" | "neutral" | "negative";
type Status = "pending" | "responded" | "escalated" | "archived";
type Platform = "instagram" | "facebook" | "twitter" | "google" | "linkedin";

interface Interaction {
  id: string;
  platform: Platform;
  type: string;
  author: string;
  authorHandle: string;
  authorAvatar: string;
  content: string;
  sentiment: Sentiment;
  status: Status;
  time: string;
  urgency: number;
  suggestedResponse?: string;
}

const mockInteractions: Interaction[] = [
  {
    id: "1",
    platform: "instagram",
    type: "comment",
    author: "Tech Enthusiast",
    authorHandle: "@tech_lover_2024",
    authorAvatar: "",
    content: "This is absolutely incredible! 🔥 Best purchase I've made this year. The quality is outstanding and customer service was amazing!",
    sentiment: "positive",
    status: "pending",
    time: "5 minutes ago",
    urgency: 3,
    suggestedResponse: "Thank you so much for your kind words! We're thrilled to hear you're loving your purchase. Your satisfaction means the world to us! 💜",
  },
  {
    id: "2",
    platform: "google",
    type: "review",
    author: "John Davidson",
    authorHandle: "John D.",
    authorAvatar: "",
    content: "Good product overall. Delivery was a bit slow (took 5 days instead of promised 2) but the product quality makes up for it. Would recommend with that caveat.",
    sentiment: "neutral",
    status: "pending",
    time: "23 minutes ago",
    urgency: 5,
    suggestedResponse: "Hi John, thank you for your honest feedback! We apologize for the delivery delay and are working to improve our shipping times. We're glad the product quality met your expectations!",
  },
  {
    id: "3",
    platform: "twitter",
    type: "mention",
    author: "Frustrated Customer",
    authorHandle: "@support_seeker",
    authorAvatar: "",
    content: "@yourcompany Still waiting on ticket #5847 after 3 days. This is unacceptable customer service. Need urgent help with my order!",
    sentiment: "negative",
    status: "escalated",
    time: "1 hour ago",
    urgency: 9,
    suggestedResponse: "We sincerely apologize for the delay! We've escalated your ticket #5847 to our priority team. Someone will reach out within the hour. Thank you for your patience.",
  },
  {
    id: "4",
    platform: "facebook",
    type: "dm",
    author: "Sarah Miller",
    authorHandle: "Sarah M.",
    authorAvatar: "",
    content: "Hi! I'm interested in your Pro plan. Can you tell me more about the team collaboration features?",
    sentiment: "neutral",
    status: "pending",
    time: "2 hours ago",
    urgency: 6,
    suggestedResponse: "Hi Sarah! Great question! Our Pro plan includes real-time collaboration for up to 3 team members, shared inbox, and role-based permissions. Would you like to schedule a demo?",
  },
  {
    id: "5",
    platform: "linkedin",
    type: "comment",
    author: "Michael Chen",
    authorHandle: "Michael C.",
    authorAvatar: "",
    content: "Impressive results from implementing your solution. Our response time dropped by 60%!",
    sentiment: "positive",
    status: "responded",
    time: "4 hours ago",
    urgency: 2,
  },
];

const platformColors: Record<Platform, string> = {
  instagram: "bg-platform-instagram",
  facebook: "bg-platform-facebook",
  twitter: "bg-platform-twitter",
  google: "bg-platform-google",
  linkedin: "bg-platform-linkedin",
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
  const [selectedInteraction, setSelectedInteraction] = useState<Interaction | null>(
    mockInteractions[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [response, setResponse] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredInteractions = mockInteractions.filter((interaction) => {
    if (platformFilter !== "all" && interaction.platform !== platformFilter) return false;
    if (statusFilter !== "all" && interaction.status !== statusFilter) return false;
    if (searchQuery && !interaction.content.toLowerCase().includes(searchQuery.toLowerCase()))
      return false;
    return true;
  });

  const handleGenerateResponse = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 1500));
    if (selectedInteraction?.suggestedResponse) {
      setResponse(selectedInteraction.suggestedResponse);
    }
    setIsGenerating(false);
  };

  const getSentimentColor = (sentiment: Sentiment) => {
    switch (sentiment) {
      case "positive":
        return "text-sentiment-positive bg-sentiment-positive/10";
      case "negative":
        return "text-sentiment-negative bg-sentiment-negative/10";
      default:
        return "text-sentiment-neutral bg-sentiment-neutral/10";
    }
  };

  const getStatusColor = (status: Status) => {
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

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex gap-6">
        {/* Interactions List */}
        <div className="w-[400px] flex flex-col border rounded-lg bg-card">
          {/* Filters */}
          <div className="p-4 border-b space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search interactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
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
              <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
              <TabsTrigger value="pending" className="flex-1">Pending</TabsTrigger>
              <TabsTrigger value="urgent" className="flex-1">Urgent</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="flex-1 overflow-auto p-2 m-0">
              <div className="space-y-2">
                {filteredInteractions.map((interaction) => {
                  const SentimentIcon = sentimentIcons[interaction.sentiment];
                  return (
                    <div
                      key={interaction.id}
                      onClick={() => {
                        setSelectedInteraction(interaction);
                        setResponse("");
                      }}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${
                        selectedInteraction?.id === interaction.id
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
                              {interaction.time}
                            </span>
                            {interaction.urgency >= 8 && (
                              <Badge variant="destructive" className="ml-auto text-xs py-0">
                                Urgent
                              </Badge>
                            )}
                          </div>
                          <p className="font-medium text-sm mb-1">{interaction.author}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {interaction.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="pending" className="flex-1 overflow-auto p-2 m-0">
              <div className="space-y-2">
                {filteredInteractions
                  .filter((i) => i.status === "pending")
                  .map((interaction) => (
                    <div
                      key={interaction.id}
                      onClick={() => {
                        setSelectedInteraction(interaction);
                        setResponse("");
                      }}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${
                        selectedInteraction?.id === interaction.id
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
                            <span className="text-xs text-muted-foreground capitalize">
                              {interaction.platform}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {interaction.time}
                            </span>
                          </div>
                          <p className="font-medium text-sm mb-1">{interaction.author}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {interaction.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="urgent" className="flex-1 overflow-auto p-2 m-0">
              <div className="space-y-2">
                {filteredInteractions
                  .filter((i) => i.urgency >= 7)
                  .map((interaction) => (
                    <div
                      key={interaction.id}
                      onClick={() => {
                        setSelectedInteraction(interaction);
                        setResponse("");
                      }}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${
                        selectedInteraction?.id === interaction.id
                          ? "bg-accent border border-primary/20"
                          : "bg-background hover:bg-muted/50 border border-transparent"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full mt-2 bg-sentiment-negative" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-muted-foreground capitalize">
                              {interaction.platform}
                            </span>
                            <Badge variant="destructive" className="text-xs py-0">
                              Urgent
                            </Badge>
                          </div>
                          <p className="font-medium text-sm mb-1">{interaction.author}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {interaction.content}
                          </p>
                        </div>
                      </div>
                    </div>
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
                      {selectedInteraction.author[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedInteraction.author}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedInteraction.authorHandle}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={getSentimentColor(selectedInteraction.sentiment)}
                      variant="secondary"
                    >
                      {sentimentIcons[selectedInteraction.sentiment] &&
                        (() => {
                          const Icon = sentimentIcons[selectedInteraction.sentiment];
                          return <Icon className="h-3 w-3 mr-1" />;
                        })()}
                      {selectedInteraction.sentiment}
                    </Badge>
                    <Badge
                      className={getStatusColor(selectedInteraction.status)}
                      variant="secondary"
                    >
                      {statusIcons[selectedInteraction.status] &&
                        (() => {
                          const Icon = statusIcons[selectedInteraction.status];
                          return <Icon className="h-3 w-3 mr-1" />;
                        })()}
                      {selectedInteraction.status}
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
                      {selectedInteraction.platform} {selectedInteraction.type}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      • {selectedInteraction.time}
                    </span>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-base">{selectedInteraction.content}</p>
                  </div>
                </div>

                {/* AI Suggested Response */}
                {selectedInteraction.suggestedResponse && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">AI Suggested Response</span>
                    </div>
                    <div className="p-4 rounded-lg border border-primary/20 bg-accent/50">
                      <p className="text-sm">{selectedInteraction.suggestedResponse}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={() => setResponse(selectedInteraction.suggestedResponse || "")}
                      >
                        Use this response
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Response Area */}
              <div className="p-6 border-t">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Your Response</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateResponse}
                      disabled={isGenerating}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {isGenerating ? "Generating..." : "Generate with AI"}
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
                    <Button variant="hero" disabled={!response}>
                      <Send className="h-4 w-4 mr-2" />
                      Send Response
                    </Button>
                  </div>
                </div>
              </div>
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
