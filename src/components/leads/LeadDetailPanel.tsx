import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  X,
  Mail,
  Phone,
  Building2,
  Calendar,
  MessageSquare,
  Loader2,
  Send,
  StickyNote,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLeads, type LeadWithDetails } from "@/hooks/useLeads";
import { LeadScoreTooltip } from "./LeadScoreTooltip";
import type { Tables, Enums } from "@/integrations/supabase/types";

type Lead = Tables<"leads">;
type LeadStatus = Enums<"lead_status">;

interface LeadDetailPanelProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Lead>) => Promise<void>;
}

const statusConfig: Record<LeadStatus, { label: string; className: string; icon: typeof Clock }> = {
  new: { label: "New", className: "bg-primary/10 text-primary", icon: Clock },
  contacted: { label: "Contacted", className: "bg-sentiment-neutral/10 text-sentiment-neutral", icon: MessageSquare },
  qualified: { label: "Qualified", className: "bg-accent text-accent-foreground", icon: CheckCircle2 },
  converted: { label: "Converted", className: "bg-sentiment-positive/10 text-sentiment-positive", icon: CheckCircle2 },
  lost: { label: "Lost", className: "bg-muted text-muted-foreground", icon: AlertCircle },
};

const activityIcons: Record<string, typeof StickyNote> = {
  note: StickyNote,
  status_change: ArrowRight,
  created: CheckCircle2,
  interaction_linked: MessageSquare,
  email_sent: Mail,
  call: Phone,
};

export function LeadDetailPanel({ lead, isOpen, onClose, onUpdate }: LeadDetailPanelProps) {
  const { fetchLeadDetails, addNote } = useLeads();
  const [details, setDetails] = useState<LeadWithDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    if (lead && isOpen) {
      setLoading(true);
      fetchLeadDetails(lead.id).then((data) => {
        setDetails(data);
        setLoading(false);
      });
    }
  }, [lead, isOpen, fetchLeadDetails]);

  const handleStatusChange = async (status: LeadStatus) => {
    if (!lead) return;
    await onUpdate(lead.id, { status });
    // Refetch details to get updated activities
    const updated = await fetchLeadDetails(lead.id);
    setDetails(updated);
  };

  const handleAddNote = async () => {
    if (!lead || !noteContent.trim()) return;
    setAddingNote(true);
    try {
      await addNote(lead.id, noteContent.trim());
      setNoteContent("");
      // Refetch to show new activity
      const updated = await fetchLeadDetails(lead.id);
      setDetails(updated);
    } finally {
      setAddingNote(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatDate(dateString);
  };

  if (!lead) return null;

  const displayLead = details || lead;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col">
        <SheetHeader className="p-6 border-b">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
                  {(displayLead.contact_name || "U")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle className="text-xl">
                  {displayLead.contact_name || "Unknown"}
                </SheetTitle>
                {displayLead.company && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Building2 className="h-3.5 w-3.5" />
                    {displayLead.company}
                  </p>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Status & Score */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Select
                  value={displayLead.status || "new"}
                  onValueChange={(value) => handleStatusChange(value as LeadStatus)}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(statusConfig) as LeadStatus[]).map((status) => (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center gap-2">
                          <Badge className={cn("text-xs", statusConfig[status].className)}>
                            {statusConfig[status].label}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <LeadScoreTooltip lead={displayLead} size="lg" />
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Contact Information</h4>
              <div className="space-y-2">
                {displayLead.contact_email && (
                  <a
                    href={`mailto:${displayLead.contact_email}`}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{displayLead.contact_email}</span>
                  </a>
                )}
                {displayLead.contact_phone && (
                  <a
                    href={`tel:${displayLead.contact_phone}`}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{displayLead.contact_phone}</span>
                  </a>
                )}
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Added {formatDate(displayLead.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Linked Interactions */}
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {details?.linked_interactions && details.linked_interactions.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">
                      Linked Interactions ({details.linked_interactions.length})
                    </h4>
                    <div className="space-y-2">
                      {details.linked_interactions.map((li) => (
                        <div
                          key={li.id}
                          className="p-3 rounded-lg border bg-muted/30"
                        >
                          {li.interaction ? (
                            <>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="text-xs capitalize">
                                  {li.interaction.platform}
                                </Badge>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {li.interaction.interaction_type}
                                </Badge>
                                <span className="text-xs text-muted-foreground ml-auto">
                                  {formatRelativeTime(li.interaction.created_at)}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {li.interaction.content}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Interaction data unavailable
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Note */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Add Note</h4>
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Write a note about this lead..."
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      rows={3}
                    />
                    <Button
                      size="sm"
                      onClick={handleAddNote}
                      disabled={!noteContent.trim() || addingNote}
                    >
                      {addingNote ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Add Note
                    </Button>
                  </div>
                </div>

                {/* Activity Timeline */}
                {details?.activities && details.activities.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Activity Timeline</h4>
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                      <div className="space-y-4">
                        {details.activities.map((activity) => {
                          const Icon = activityIcons[activity.activity_type] || StickyNote;
                          return (
                            <div key={activity.id} className="relative flex gap-4 pl-10">
                              <div className="absolute left-2.5 -translate-x-1/2 w-3 h-3 rounded-full bg-background border-2 border-primary" />
                              <div className="flex-1 pb-4">
                                <div className="flex items-center gap-2 mb-1">
                                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span className="text-xs font-medium capitalize">
                                    {activity.activity_type.replace("_", " ")}
                                  </span>
                                  <span className="text-xs text-muted-foreground ml-auto">
                                    {formatRelativeTime(activity.created_at)}
                                  </span>
                                </div>
                                {activity.content && (
                                  <p className="text-sm text-muted-foreground">
                                    {activity.content}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
