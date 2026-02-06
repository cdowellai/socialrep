import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  User,
  Bot,
  Clock,
  Mail,
  ArrowRight,
  BarChart3,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useChatbotConversations, type ChatbotConversation } from "@/hooks/useChatbotConversations";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";

export function ConversationsTab() {
  const {
    conversations,
    selectedConversation,
    messages,
    analytics,
    loading,
    loadingMessages,
    selectConversation,
    updateConversationStatus,
    clearSelection,
  } = useChatbotConversations();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Section */}
      {analytics && <ConversationAnalytics analytics={analytics} />}

      {/* Conversations List & Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs">Chat conversations will appear here</p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="divide-y">
                  {conversations.map((conversation) => (
                    <ConversationItem
                      key={conversation.id}
                      conversation={conversation}
                      isSelected={selectedConversation?.id === conversation.id}
                      onClick={() => selectConversation(conversation.id)}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Right Panel - Conversation Detail */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 border-b">
            {selectedConversation ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {(selectedConversation.visitor_name?.[0] || selectedConversation.visitor_id?.[0] || "V").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {selectedConversation.visitor_name || "Anonymous Visitor"}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {selectedConversation.visitor_email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {selectedConversation.visitor_email}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(selectedConversation.started_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ResolutionBadge resolutionType={selectedConversation.resolution_type} />
                  <Select
                    value={selectedConversation.resolution_type || "pending"}
                    onValueChange={(value) =>
                      updateConversationStatus(selectedConversation.id, value as "bot" | "human" | "pending")
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="bot">Bot Resolved</SelectItem>
                      <SelectItem value="human">Human Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <CardTitle className="text-lg text-muted-foreground">
                Select a conversation to view details
              </CardTitle>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {loadingMessages ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : selectedConversation ? (
              <ScrollArea className="h-[450px] p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-2",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {message.role === "assistant" && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[75%] rounded-lg px-3 py-2 text-sm",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        {message.role === "assistant" ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        ) : (
                          message.content
                        )}
                        <p className="text-[10px] opacity-60 mt-1">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      {message.role === "user" && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                          <User className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="h-[450px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <ArrowRight className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Select a conversation from the list</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ConversationItem({
  conversation,
  isSelected,
  onClick,
}: {
  conversation: ChatbotConversation;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-4 text-left hover:bg-muted/50 transition-colors",
        isSelected && "bg-muted"
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="text-xs">
            {(conversation.visitor_name?.[0] || "V").toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-sm truncate">
              {conversation.visitor_name || "Anonymous"}
            </p>
            <ResolutionBadge resolutionType={conversation.resolution_type} size="sm" />
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {conversation.visitor_email || conversation.visitor_id}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(conversation.started_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </button>
  );
}

function ResolutionBadge({
  resolutionType,
  size = "default",
}: {
  resolutionType: string | null;
  size?: "sm" | "default";
}) {
  const sizeClass = size === "sm" ? "text-[10px] px-1.5 py-0" : "";

  switch (resolutionType) {
    case "bot":
      return (
        <Badge variant="outline" className={cn("text-sentiment-positive border-sentiment-positive", sizeClass)}>
          <Bot className={cn("mr-1", size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3")} />
          Bot
        </Badge>
      );
    case "human":
      return (
        <Badge variant="outline" className={cn("text-primary border-primary", sizeClass)}>
          <User className={cn("mr-1", size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3")} />
          Human
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className={cn("text-sentiment-neutral border-sentiment-neutral", sizeClass)}>
          <Clock className={cn("mr-1", size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3")} />
          Pending
        </Badge>
      );
  }
}

function ConversationAnalytics({
  analytics,
}: {
  analytics: {
    totalConversations: number;
    botResolutionRate: number;
    avgConversationLength: number;
    topQuestions: Array<{ question: string; count: number }>;
  };
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.totalConversations}</p>
              <p className="text-xs text-muted-foreground">Total Conversations</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-sentiment-positive/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-sentiment-positive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.botResolutionRate}%</p>
              <p className="text-xs text-muted-foreground">Bot Resolution Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.avgConversationLength}</p>
              <p className="text-xs text-muted-foreground">Avg Messages/Chat</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-sentiment-neutral/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-sentiment-neutral" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium mb-1">Top Questions</p>
              {analytics.topQuestions.length > 0 ? (
                <div className="space-y-0.5">
                  {analytics.topQuestions.slice(0, 3).map((q, i) => (
                    <p key={i} className="text-xs text-muted-foreground truncate">
                      {q.question} ({q.count})
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No data yet</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
