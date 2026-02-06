import { AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResponseTimeIndicatorProps {
  createdAt: string;
  respondedAt: string | null;
  status: string | null;
  className?: string;
}

export function ResponseTimeIndicator({
  createdAt,
  respondedAt,
  status,
  className,
}: ResponseTimeIndicatorProps) {
  const now = new Date();
  const created = new Date(createdAt);
  const responded = respondedAt ? new Date(respondedAt) : null;

  // Calculate response time or time waiting
  const targetDate = responded || now;
  const diffMs = targetDate.getTime() - created.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  // Format the time difference
  const formatTime = () => {
    if (diffDays > 0) {
      const remainingHours = Math.floor((diffMs % 86400000) / 3600000);
      return `${diffDays}d ${remainingHours}h`;
    }
    if (diffHours > 0) {
      const remainingMinutes = Math.floor((diffMs % 3600000) / 60000);
      return `${diffHours}h ${remainingMinutes}m`;
    }
    return `${diffMinutes}m`;
  };

  // Determine urgency level (warning if no response for > 4 hours)
  const isUrgent = !responded && diffHours >= 4;
  const isCritical = !responded && diffHours >= 6;

  if (status === "responded" && responded) {
    return (
      <div className={cn("flex items-center gap-1.5 text-xs", className)}>
        <CheckCircle2 className="h-3.5 w-3.5 text-sentiment-positive" />
        <span className="text-muted-foreground">
          Response time: <span className="font-medium text-foreground">{formatTime()}</span>
        </span>
      </div>
    );
  }

  if (status === "archived") {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs",
        isCritical && "text-sentiment-negative",
        isUrgent && !isCritical && "text-sentiment-neutral",
        !isUrgent && "text-muted-foreground",
        className
      )}
    >
      {isCritical ? (
        <>
          <AlertTriangle className="h-3.5 w-3.5" />
          <span className="font-medium">⚠️ No response for {formatTime()}</span>
        </>
      ) : isUrgent ? (
        <>
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Waiting {formatTime()}</span>
        </>
      ) : (
        <>
          <Clock className="h-3.5 w-3.5" />
          <span>Received {formatTime()} ago</span>
        </>
      )}
    </div>
  );
}
