import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format, subDays, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { cn } from "@/lib/utils";
import type { DateRange as CalendarDateRange } from "react-day-picker";

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface AnalyticsDateFilterProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

const presets = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "This month", value: "this_month" },
  { label: "Last month", value: "last_month" },
  { label: "Custom", value: "custom" },
];

export function AnalyticsDateFilter({
  dateRange,
  onDateRangeChange,
}: AnalyticsDateFilterProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>("30d");

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value);
    
    const now = new Date();
    let start: Date;
    let end: Date = now;
    
    switch (value) {
      case "7d":
        start = subDays(now, 7);
        break;
      case "30d":
        start = subDays(now, 30);
        break;
      case "90d":
        start = subDays(now, 90);
        break;
      case "this_month":
        start = startOfMonth(now);
        end = now;
        break;
      case "last_month":
        const lastMonth = subMonths(now, 1);
        start = startOfMonth(lastMonth);
        end = endOfMonth(lastMonth);
        break;
      default:
        return; // Custom - don't change
    }
    
    onDateRangeChange({ startDate: start, endDate: end });
  };

  const handleCustomDateChange = (range: CalendarDateRange | undefined) => {
    if (range?.from) {
      setSelectedPreset("custom");
      onDateRangeChange({
        startDate: range.from,
        endDate: range.to || range.from,
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedPreset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-36">
          <CalendarIcon className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Period" />
        </SelectTrigger>
        <SelectContent>
          {presets.map((preset) => (
            <SelectItem key={preset.value} value={preset.value}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedPreset === "custom" && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !dateRange.startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.startDate ? (
                dateRange.endDate ? (
                  <>
                    {format(dateRange.startDate, "LLL dd, y")} -{" "}
                    {format(dateRange.endDate, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.startDate, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange.startDate}
              selected={{
                from: dateRange.startDate,
                to: dateRange.endDate,
              }}
              onSelect={handleCustomDateChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
