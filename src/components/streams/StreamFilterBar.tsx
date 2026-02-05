import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Search,
  Filter,
  SlidersHorizontal,
  Sparkles,
  X,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Stream } from "@/hooks/useStreams";

export interface StreamFilters {
  search: string;
  sentiment: string;
  status: string;
  minUrgency: number;
  showAiDraftsOnly: boolean;
}

interface StreamFilterBarProps {
  stream: Stream;
  filters: StreamFilters;
  onFiltersChange: (filters: StreamFilters) => void;
  interactionCount: number;
  urgentCount: number;
  onToggleAiPrioritization: (enabled: boolean) => void;
}

export function StreamFilterBar({
  stream,
  filters,
  onFiltersChange,
  interactionCount,
  urgentCount,
  onToggleAiPrioritization,
}: StreamFilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = <K extends keyof StreamFilters>(
    key: K,
    value: StreamFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      sentiment: "all",
      status: "all",
      minUrgency: 0,
      showAiDraftsOnly: false,
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.sentiment !== "all" ||
    filters.status !== "all" ||
    filters.minUrgency > 0 ||
    filters.showAiDraftsOnly;

  return (
    <div className="space-y-3">
      {/* Primary Filter Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filters.sentiment}
            onValueChange={(value) => updateFilter("sentiment", value)}
          >
            <SelectTrigger className="w-32 h-9">
              <SelectValue placeholder="Sentiment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sentiments</SelectItem>
              <SelectItem value="positive">Positive</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="negative">Negative</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.status}
            onValueChange={(value) => updateFilter("status", value)}
          >
            <SelectTrigger className="w-32 h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="responded">Responded</SelectItem>
              <SelectItem value="escalated">Escalated</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          {/* Advanced Filters Toggle */}
          <Popover open={showAdvanced} onOpenChange={setShowAdvanced}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                More
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Advanced Filters</h4>

                {/* Urgency Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Minimum Urgency</Label>
                    <span className="text-xs text-muted-foreground">
                      {filters.minUrgency > 0 ? `${filters.minUrgency}+` : "All"}
                    </span>
                  </div>
                  <Slider
                    value={[filters.minUrgency]}
                    onValueChange={([value]) => updateFilter("minUrgency", value)}
                    min={0}
                    max={10}
                    step={1}
                  />
                </div>

                {/* AI Drafts Only */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="ai-drafts" className="text-sm">
                    Show AI drafts only
                  </Label>
                  <Switch
                    id="ai-drafts"
                    checked={filters.showAiDraftsOnly}
                    onCheckedChange={(checked) =>
                      updateFilter("showAiDraftsOnly", checked)
                    }
                  />
                </div>

                {/* AI Auto-Prioritization */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="space-y-0.5">
                    <Label htmlFor="ai-priority" className="text-sm">
                      AI Auto-Prioritization
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Bubble urgent items to top
                    </p>
                  </div>
                  <Switch
                    id="ai-priority"
                    checked={stream.auto_sort_by_urgency ?? false}
                    onCheckedChange={onToggleAiPrioritization}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 text-muted-foreground"
              onClick={clearFilters}
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">
          {interactionCount} interaction{interactionCount !== 1 ? "s" : ""}
        </span>
        {urgentCount > 0 && (
          <Badge variant="destructive" className="text-xs">
            {urgentCount} urgent
          </Badge>
        )}
        {stream.auto_sort_by_urgency && (
          <Badge variant="outline" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Prioritized
          </Badge>
        )}
        {hasActiveFilters && (
          <Badge variant="secondary" className="text-xs">
            <Filter className="h-3 w-3 mr-1" />
            Filtered
          </Badge>
        )}
      </div>
    </div>
  );
}
