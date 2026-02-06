import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, Mail, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { LeadScoreTooltip } from "./LeadScoreTooltip";
import type { Tables, Enums } from "@/integrations/supabase/types";

type Lead = Tables<"leads">;
type LeadStatus = Enums<"lead_status">;

interface LeadKanbanBoardProps {
  leads: Lead[];
  onStatusChange: (leadId: string, newStatus: LeadStatus) => Promise<void>;
  onLeadClick: (lead: Lead) => void;
}

const columns: { id: LeadStatus; label: string; color: string }[] = [
  { id: "new", label: "New", color: "bg-primary/10 border-primary/30" },
  { id: "contacted", label: "Contacted", color: "bg-sentiment-neutral/10 border-sentiment-neutral/30" },
  { id: "qualified", label: "Qualified", color: "bg-accent/10 border-accent/30" },
  { id: "converted", label: "Converted", color: "bg-sentiment-positive/10 border-sentiment-positive/30" },
  { id: "lost", label: "Lost", color: "bg-muted border-border" },
];

function SortableLeadCard({
  lead,
  onClick,
}: {
  lead: Lead;
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "touch-none",
        isDragging && "opacity-50"
      )}
    >
      <LeadCard
        lead={lead}
        onClick={onClick}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

function LeadCard({
  lead,
  onClick,
  dragHandleProps,
  isOverlay,
}: {
  lead: Lead;
  onClick: () => void;
  dragHandleProps?: any;
  isOverlay?: boolean;
}) {
  return (
    <Card
      className={cn(
        "cursor-pointer hover:border-primary/50 transition-all",
        isOverlay && "shadow-lg rotate-2"
      )}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          {dragHandleProps && (
            <button
              {...dragHandleProps}
              className="mt-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {(lead.contact_name || "U")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm truncate">
                {lead.contact_name || "Unknown"}
              </span>
            </div>

            {lead.company && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                <Building2 className="h-3 w-3" />
                <span className="truncate">{lead.company}</span>
              </div>
            )}

            {lead.contact_email && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                <Mail className="h-3 w-3" />
                <span className="truncate">{lead.contact_email}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              {lead.source_platform && (
                <Badge variant="secondary" className="text-[10px] capitalize">
                  {lead.source_platform}
                </Badge>
              )}
              <LeadScoreTooltip lead={lead} size="sm" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function LeadKanbanBoard({
  leads,
  onStatusChange,
  onLeadClick,
}: LeadKanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const leadId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column
    const targetColumn = columns.find((col) => col.id === overId);
    if (targetColumn) {
      const lead = leads.find((l) => l.id === leadId);
      if (lead && lead.status !== targetColumn.id) {
        await onStatusChange(leadId, targetColumn.id);
      }
    }
  };

  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null;

  const getColumnLeads = (status: LeadStatus) =>
    leads.filter((lead) => lead.status === status);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => {
          const columnLeads = getColumnLeads(column.id);

          return (
            <div
              key={column.id}
              className="flex-shrink-0 w-72"
            >
              <div
                className={cn(
                  "rounded-lg border-2 border-dashed p-3 min-h-[500px]",
                  column.color
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-sm">{column.label}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {columnLeads.length}
                  </Badge>
                </div>

                <SortableContext
                  id={column.id}
                  items={columnLeads.map((l) => l.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <ScrollArea className="h-[440px]">
                    <div className="space-y-2 pr-2">
                      {columnLeads.map((lead) => (
                        <SortableLeadCard
                          key={lead.id}
                          lead={lead}
                          onClick={() => onLeadClick(lead)}
                        />
                      ))}
                      {columnLeads.length === 0 && (
                        <div className="text-center py-8 text-xs text-muted-foreground">
                          No leads
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </SortableContext>
              </div>
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeLead ? (
          <LeadCard lead={activeLead} onClick={() => {}} isOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
