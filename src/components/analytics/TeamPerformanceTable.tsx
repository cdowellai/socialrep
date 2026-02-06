import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TeamMemberPerformance } from "@/hooks/useAnalytics";

interface TeamPerformanceTableProps {
  teamPerformance: TeamMemberPerformance[] | null;
  loading?: boolean;
}

type SortKey = "name" | "interactionsHandled" | "avgResponseTimeHours" | "resolutionRate" | "sentimentScore";
type SortDirection = "asc" | "desc";

export function TeamPerformanceTable({
  teamPerformance,
  loading,
}: TeamPerformanceTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("interactionsHandled");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const sortedData = useMemo(() => {
    if (!teamPerformance) return [];

    return [...teamPerformance].sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];

      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (sortDirection === "asc") {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
  }, [teamPerformance, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) {
      return <ArrowUpDown className="h-3.5 w-3.5 ml-1 text-muted-foreground" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5 ml-1" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 ml-1" />
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!teamPerformance || teamPerformance.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
            <Users className="h-12 w-12 mb-4 opacity-20" />
            <p>No team data available</p>
            <p className="text-sm">Invite team members to see their performance</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 -ml-2 font-medium"
                    onClick={() => handleSort("name")}
                  >
                    Team Member
                    <SortIcon columnKey="name" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 font-medium"
                    onClick={() => handleSort("interactionsHandled")}
                  >
                    Interactions
                    <SortIcon columnKey="interactionsHandled" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 font-medium"
                    onClick={() => handleSort("avgResponseTimeHours")}
                  >
                    Avg Response
                    <SortIcon columnKey="avgResponseTimeHours" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 font-medium"
                    onClick={() => handleSort("resolutionRate")}
                  >
                    Resolution Rate
                    <SortIcon columnKey="resolutionRate" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 font-medium"
                    onClick={() => handleSort("sentimentScore")}
                  >
                    Sentiment
                    <SortIcon columnKey="sentimentScore" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((member) => (
                <TableRow key={member.userId}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatarUrl || ""} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {member.name[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {member.interactionsHandled}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-medium",
                        member.avgResponseTimeHours <= 2
                          ? "text-sentiment-positive border-sentiment-positive"
                          : member.avgResponseTimeHours <= 4
                          ? "text-sentiment-neutral border-sentiment-neutral"
                          : "text-sentiment-negative border-sentiment-negative"
                      )}
                    >
                      {member.avgResponseTimeHours}h
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-medium",
                        member.resolutionRate >= 80
                          ? "text-sentiment-positive border-sentiment-positive"
                          : member.resolutionRate >= 50
                          ? "text-sentiment-neutral border-sentiment-neutral"
                          : "text-sentiment-negative border-sentiment-negative"
                      )}
                    >
                      {member.resolutionRate}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-medium",
                        member.sentimentScore >= 70
                          ? "text-sentiment-positive border-sentiment-positive"
                          : member.sentimentScore >= 40
                          ? "text-sentiment-neutral border-sentiment-neutral"
                          : "text-sentiment-negative border-sentiment-negative"
                      )}
                    >
                      {member.sentimentScore}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
