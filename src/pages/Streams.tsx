import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInteractions } from "@/hooks/useInteractions";
import { MessageSquare, RefreshCw, Facebook, Instagram } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

const platformIcon: Record<string, React.ReactNode> = {
  facebook: <Facebook className="w-4 h-4 text-blue-600" />,
  instagram: <Instagram className="w-4 h-4 text-pink-500" />,
};

const typeLabel: Record<string, string> = {
  comment: "Comment",
  message: "Message",
  review: "Review",
  mention: "Mention",
};

export default function Streams() {
  const { interactions, loading, refetch } = useInteractions();
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Streams</h1>
            <p className="text-muted-foreground">
              Live feed of all incoming interactions across your connected platforms
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="h-20" />
              </Card>
            ))}
          </div>
        ) : interactions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No interactions yet</h3>
              <p className="text-muted-foreground mb-4">
                New comments, messages, and mentions will appear here in real time.
              </p>
              <Button onClick={() => navigate("/dashboard/settings?tab=platforms")}>
                Connect Platforms
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {interactions.map((interaction) => (
              <Card key={interaction.id} className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate("/dashboard/inbox")}>
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 shrink-0">
                      {platformIcon[interaction.platform] ?? (
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-sm">
                          {interaction.author_name || "Facebook User"}
                        </span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {typeLabel[interaction.interaction_type] || interaction.interaction_type}
                        </Badge>
                        {interaction.status === "pending" && (
                          <Badge variant="destructive" className="text-xs">
                            Needs Reply
                          </Badge>
                        )}
                        {interaction.status === "responded" && (
                          <Badge className="text-xs bg-green-600 text-white">
                            Replied
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-foreground line-clamp-2">
                        {interaction.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(interaction.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                      onClick={(e) => { e.stopPropagation(); navigate("/dashboard/inbox"); }}
                    >
                      Reply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
