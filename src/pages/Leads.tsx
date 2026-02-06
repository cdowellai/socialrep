import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  ExternalLink,
  Mail,
  Building2,
  Loader2,
} from "lucide-react";
import { useLeads } from "@/hooks/useLeads";
import { useSubscription } from "@/hooks/useSubscription";
import { FeaturePaywall } from "@/components/subscription";
import {
  LeadDetailPanel,
  LeadScoreTooltip,
  LeadViewToggle,
  LeadKanbanBoard,
  type LeadViewMode,
} from "@/components/leads";
import type { Tables, Enums } from "@/integrations/supabase/types";

type Lead = Tables<"leads">;
type LeadStatus = Enums<"lead_status">;

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  new: { label: "New", className: "bg-primary/10 text-primary" },
  contacted: { label: "Contacted", className: "bg-sentiment-neutral/10 text-sentiment-neutral" },
  qualified: { label: "Qualified", className: "bg-accent text-accent-foreground" },
  converted: { label: "Converted", className: "bg-sentiment-positive/10 text-sentiment-positive" },
  lost: { label: "Lost", className: "bg-muted text-muted-foreground" },
};

export default function LeadsPage() {
  const { leads, loading, stats, updateLead } = useLeads();
  const { hasFeature, loading: subLoading } = useSubscription();
  const [viewMode, setViewMode] = useState<LeadViewMode>("table");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Check if user has leads feature
  const hasLeadsFeature = hasFeature("leads");

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      !searchQuery ||
      lead.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.contact_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead);
    setDetailOpen(true);
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    await updateLead(leadId, { status: newStatus });
  };

  const handleUpdateLead = async (id: string, updates: Partial<Lead>) => {
    await updateLead(id, updates);
    // Update selected lead if it's the one being updated
    if (selectedLead?.id === id) {
      setSelectedLead((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    const weeks = Math.floor(diff / 604800000);

    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return `${weeks}w ago`;
  };

  const statCards = [
    { label: "Total Leads", value: stats.total, change: `${stats.new} new this week` },
    { label: "Conversion Rate", value: stats.total > 0 ? `${Math.round((stats.converted / stats.total) * 100)}%` : "0%", change: `${stats.converted} converted` },
    { label: "New This Week", value: stats.new, change: "Ready for outreach" },
    { label: "Avg Score", value: stats.avgScore, change: "Lead quality" },
  ];

  if (loading || subLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  // Show paywall if user doesn't have leads feature
  if (!hasLeadsFeature) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Lead Management</h2>
            <p className="text-muted-foreground">
              Track and manage leads detected from social interactions
            </p>
          </div>
          <FeaturePaywall
            feature="Lead Generation"
            description="Automatically capture leads from social interactions and track them through your sales pipeline."
            requiredPlan="Professional"
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Lead Management</h2>
            <p className="text-muted-foreground">
              Track and manage leads detected from social interactions
            </p>
          </div>
          <div className="flex gap-2">
            <LeadViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Sync to CRM
            </Button>
            <Button variant="hero">
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold mt-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Kanban View */}
        {viewMode === "kanban" && (
          <LeadKanbanBoard
            leads={filteredLeads}
            onStatusChange={handleStatusChange}
            onLeadClick={handleViewLead}
          />
        )}

        {/* Table View */}
        {viewMode === "table" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Leads</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search leads..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredLeads.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="mb-2">No leads found</p>
                  <p className="text-sm">
                    Leads are automatically created from social interactions or you can add them manually.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contact</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-semibold">
                              {(lead.contact_name || "U")[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium">{lead.contact_name || "Unknown"}</p>
                              {lead.contact_email && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                  {lead.contact_email}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {lead.company ? (
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              {lead.company}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {lead.source_platform ? (
                            <Badge variant="secondary" className="capitalize">
                              {lead.source_platform}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <LeadScoreTooltip lead={lead} />
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig[lead.status || "new"].className}>
                            {statusConfig[lead.status || "new"].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatTime(lead.created_at)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewLead(lead)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Lead Detail Panel */}
      <LeadDetailPanel
        lead={selectedLead}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        onUpdate={handleUpdateLead}
      />
    </DashboardLayout>
  );
}
