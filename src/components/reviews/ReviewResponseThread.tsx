import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, MessageSquare, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewResponseThreadProps {
  response: string | null;
  respondedAt: string | null;
  respondedBy?: string | null;
  responseType?: string | null;
}

export function ReviewResponseThread({
  response,
  respondedAt,
  respondedBy,
  responseType,
}: ReviewResponseThreadProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!response) return null;

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

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-3">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between h-auto py-2 px-3 text-left hover:bg-muted/50"
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Your Response</span>
            {responseType === "ai" && (
              <Badge variant="secondary" className="text-[10px] px-1.5">
                AI Generated
              </Badge>
            )}
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-sm text-foreground whitespace-pre-wrap">
            {response}
          </p>
          
          {respondedAt && (
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-primary/10 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                <span>Sent {formatDate(respondedAt)}</span>
              </div>
              {respondedBy && (
                <div className="flex items-center gap-1.5">
                  <Avatar className="h-4 w-4">
                    <AvatarFallback className="text-[8px]">
                      {respondedBy[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>by {respondedBy}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
