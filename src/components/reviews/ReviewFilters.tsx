import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Star, Filter } from "lucide-react";
import type { ReviewFilters as Filters } from "@/hooks/useReviews";

interface ReviewFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  pendingCount: number;
}

const platforms = [
  { value: "all", label: "All Platforms" },
  { value: "google", label: "Google" },
  { value: "yelp", label: "Yelp" },
  { value: "facebook", label: "Facebook" },
  { value: "tripadvisor", label: "TripAdvisor" },
  { value: "trustpilot", label: "Trustpilot" },
  { value: "g2", label: "G2" },
  { value: "capterra", label: "Capterra" },
];

const ratings = [
  { value: "all", label: "All Ratings" },
  { value: "5", label: "5 Stars" },
  { value: "4", label: "4 Stars" },
  { value: "3", label: "3 Stars" },
  { value: "2", label: "2 Stars" },
  { value: "1", label: "1 Star" },
];

const statuses = [
  { value: "all", label: "All Reviews" },
  { value: "responded", label: "Responded" },
  { value: "pending", label: "Pending" },
];

export function ReviewFilters({
  filters,
  onFiltersChange,
  pendingCount,
}: ReviewFiltersProps) {
  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasActiveFilters =
    filters.platform !== "all" ||
    filters.rating !== "all" ||
    filters.status !== "all";

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg border bg-card">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span>Filters:</span>
      </div>

      {/* Platform Filter */}
      <Select
        value={filters.platform}
        onValueChange={(value) => updateFilter("platform", value)}
      >
        <SelectTrigger className="w-40 h-9">
          <SelectValue placeholder="Platform" />
        </SelectTrigger>
        <SelectContent>
          {platforms.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Rating Filter */}
      <Select
        value={filters.rating}
        onValueChange={(value) => updateFilter("rating", value)}
      >
        <SelectTrigger className="w-32 h-9">
          <SelectValue placeholder="Rating" />
        </SelectTrigger>
        <SelectContent>
          {ratings.map((r) => (
            <SelectItem key={r.value} value={r.value}>
              <div className="flex items-center gap-2">
                {r.value !== "all" && (
                  <Star className="h-3 w-3 fill-sentiment-neutral text-sentiment-neutral" />
                )}
                {r.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select
        value={filters.status}
        onValueChange={(value) => updateFilter("status", value)}
      >
        <SelectTrigger className="w-36 h-9">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              <div className="flex items-center gap-2">
                {s.label}
                {s.value === "pending" && pendingCount > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                    {pendingCount}
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Badge variant="secondary" className="text-xs">
          <Filter className="h-3 w-3 mr-1" />
          Filtered
        </Badge>
      )}
    </div>
  );
}
