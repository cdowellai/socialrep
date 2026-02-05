import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Palette } from "lucide-react";
import type { Stream, StreamInsert, StreamUpdate } from "@/hooks/useStreams";

interface AddStreamDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<StreamInsert, "user_id"> | StreamUpdate) => Promise<any>;
  editingStream?: Stream | null;
}

const platforms = [
  { value: "all", label: "All Platforms" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "twitter", label: "Twitter/X" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "google", label: "Google" },
  { value: "yelp", label: "Yelp" },
  { value: "tripadvisor", label: "TripAdvisor" },
  { value: "trustpilot", label: "Trustpilot" },
  { value: "g2", label: "G2" },
  { value: "capterra", label: "Capterra" },
];

const interactionTypes = [
  { value: "comment", label: "Comments" },
  { value: "message", label: "Messages/DMs" },
  { value: "review", label: "Reviews" },
  { value: "mention", label: "Mentions" },
];

const presetColors = [
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#ef4444", // Red
  "#f97316", // Orange
  "#eab308", // Yellow
  "#22c55e", // Green
  "#14b8a6", // Teal
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
];

export function AddStreamDialog({
  isOpen,
  onClose,
  onSave,
  editingStream,
}: AddStreamDialogProps) {
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("all");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["comment", "message", "review", "mention"]);
  const [color, setColor] = useState("#6366f1");
  const [showAiSuggestions, setShowAiSuggestions] = useState(true);
  const [autoSortByUrgency, setAutoSortByUrgency] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingStream) {
      setName(editingStream.name);
      setPlatform(editingStream.platform || "all");
      setSelectedTypes(editingStream.interaction_types || ["comment", "message", "review", "mention"]);
      setColor(editingStream.color || "#6366f1");
      setShowAiSuggestions(editingStream.show_ai_suggestions ?? true);
      setAutoSortByUrgency(editingStream.auto_sort_by_urgency ?? true);
    } else {
      // Reset form for new stream
      setName("");
      setPlatform("all");
      setSelectedTypes(["comment", "message", "review", "mention"]);
      setColor(presetColors[Math.floor(Math.random() * presetColors.length)]);
      setShowAiSuggestions(true);
      setAutoSortByUrgency(true);
    }
  }, [editingStream, isOpen]);

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || selectedTypes.length === 0) return;

    setSaving(true);
    try {
      const data = {
        name: name.trim(),
        platform: platform === "all" ? null : platform,
        interaction_types: selectedTypes,
        color,
        show_ai_suggestions: showAiSuggestions,
        auto_sort_by_urgency: autoSortByUrgency,
      };

      await onSave(data);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editingStream ? "Edit Stream" : "Add New Stream"}
            </DialogTitle>
            <DialogDescription>
              {editingStream
                ? "Update your stream settings and filters."
                : "Create a new stream to organize your interactions."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Stream Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Facebook Comments, Urgent Reviews"
                required
              />
            </div>

            {/* Platform */}
            <div className="space-y-2">
              <Label>Platform Filter</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="All platforms" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Interaction Types */}
            <div className="space-y-2">
              <Label>Interaction Types</Label>
              <div className="grid grid-cols-2 gap-2">
                {interactionTypes.map((type) => (
                  <label
                    key={type.value}
                    className="flex items-center gap-2 p-2 rounded-lg border cursor-pointer hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={selectedTypes.includes(type.value)}
                      onCheckedChange={() => handleTypeToggle(type.value)}
                    />
                    <span className="text-sm">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Stream Color
              </Label>
              <div className="flex flex-wrap gap-2">
                {presetColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-8 w-8 rounded-full transition-all ${
                      color === c ? "ring-2 ring-offset-2 ring-primary" : ""
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* AI Settings */}
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Show AI Suggestions</Label>
                  <p className="text-xs text-muted-foreground">
                    Display AI-drafted responses inline
                  </p>
                </div>
                <Switch
                  checked={showAiSuggestions}
                  onCheckedChange={setShowAiSuggestions}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Auto-Sort by Urgency</Label>
                  <p className="text-xs text-muted-foreground">
                    Prioritize urgent items at the top
                  </p>
                </div>
                <Switch
                  checked={autoSortByUrgency}
                  onCheckedChange={setAutoSortByUrgency}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || !name.trim() || selectedTypes.length === 0}
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingStream ? "Save Changes" : "Create Stream"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
