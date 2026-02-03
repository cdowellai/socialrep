import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Search, Filter, Plus, ExternalLink, Mail, Phone, Building2 } from "lucide-react";

type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  status: LeadStatus;
  score: number;
  createdAt: string;
}

const mockLeads: Lead[] = [
  {
    id: "1",
    name: "Emily Watson",
    email: "emily@techcorp.com",
    phone: "+1 (555) 123-4567",
    company: "TechCorp Inc.",
    source: "Instagram DM",
    status: "new",
    score: 85,
    createdAt: "2 hours ago",
  },
  {
    id: "2",
    name: "Marcus Johnson",
    email: "marcus@startup.io",
    phone: "+1 (555) 234-5678",
    company: "Startup.io",
    source: "Twitter Mention",
    status: "contacted",
    score: 72,
    createdAt: "1 day ago",
  },
  {
    id: "3",
    name: "Sarah Chen",
    email: "sarah@enterprise.com",
    phone: "+1 (555) 345-6789",
    company: "Enterprise Solutions",
    source: "LinkedIn Comment",
    status: "qualified",
    score: 92,
    createdAt: "2 days ago",
  },
  {
    id: "4",
    name: "James Wilson",
    email: "james@smallbiz.com",
    phone: "+1 (555) 456-7890",
    company: "SmallBiz Co.",
    source: "Google Review",
    status: "converted",
    score: 88,
    createdAt: "1 week ago",
  },
  {
    id: "5",
    name: "Amanda Foster",
    email: "amanda@agency.co",
    phone: "+1 (555) 567-8901",
    company: "Creative Agency",
    source: "Facebook DM",
    status: "lost",
    score: 45,
    createdAt: "2 weeks ago",
  },
];

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  new: { label: "New", className: "bg-primary/10 text-primary" },
  contacted: { label: "Contacted", className: "bg-sentiment-neutral/10 text-sentiment-neutral" },
  qualified: { label: "Qualified", className: "bg-accent text-accent-foreground" },
  converted: { label: "Converted", className: "bg-sentiment-positive/10 text-sentiment-positive" },
  lost: { label: "Lost", className: "bg-muted text-muted-foreground" },
};

const stats = [
  { label: "Total Leads", value: "156", change: "+12 this week" },
  { label: "Conversion Rate", value: "24%", change: "+3% vs last month" },
  { label: "New This Week", value: "28", change: "↑ from 21" },
  { label: "Avg Score", value: "68", change: "+5 points" },
];

export default function LeadsPage() {
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
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold mt-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Leads</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search leads..." className="pl-9 w-64" />
                </div>
                <Select defaultValue="all">
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
                {mockLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-semibold">
                          {lead.name[0]}
                        </div>
                        <div>
                          <p className="font-medium">{lead.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {lead.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {lead.company}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{lead.source}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            lead.score >= 80
                              ? "bg-sentiment-positive"
                              : lead.score >= 50
                              ? "bg-sentiment-neutral"
                              : "bg-sentiment-negative"
                          }`}
                        />
                        <span className="font-medium">{lead.score}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[lead.status].className}>
                        {statusConfig[lead.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{lead.createdAt}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
