import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useBrandVoice, BrandVoiceSample } from "@/hooks/useBrandVoice";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Sparkles,
  MessageSquare,
  FileText,
  Tag,
  Quote,
  Trash2,
  Upload,
  Download,
  Brain,
} from "lucide-react";

const sampleTypeConfig = {
  response: { icon: MessageSquare, label: "Example Response", color: "bg-blue-500" },
  guideline: { icon: FileText, label: "Brand Guideline", color: "bg-purple-500" },
  keyword: { icon: Tag, label: "Key Term", color: "bg-green-500" },
  phrase: { icon: Quote, label: "Brand Phrase", color: "bg-orange-500" },
};

export function BrandVoiceTraining() {
  const { samples, loading, addSample, addBulkSamples, deleteSample, clearAllSamples, getBrandContext } =
    useBrandVoice();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    sample_type: "response" as BrandVoiceSample["sample_type"],
    content: "",
    context: "",
    sentiment: "",
    platform: "",
  });
  const [bulkText, setBulkText] = useState("");

  const handleAddSample = async () => {
    try {
      await addSample({
        sample_type: formData.sample_type,
        content: formData.content,
        context: formData.context || null,
        sentiment: formData.sentiment || null,
        platform: formData.platform || null,
      });
      toast({ title: "Sample added", description: "Brand voice sample has been saved." });
      setDialogOpen(false);
      setFormData({
        sample_type: "response",
        content: "",
        context: "",
        sentiment: "",
        platform: "",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to add sample",
        variant: "destructive",
      });
    }
  };

  const handleBulkImport = async () => {
    try {
      // Parse bulk text - each line is a sample
      const lines = bulkText
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l);

      if (lines.length === 0) {
        toast({ title: "No content", description: "Please enter some samples", variant: "destructive" });
        return;
      }

      const newSamples = lines.map((content) => ({
        sample_type: "response" as const,
        content,
        context: null,
        sentiment: null,
        platform: null,
      }));

      await addBulkSamples(newSamples);
      toast({
        title: "Samples imported",
        description: `${lines.length} samples have been added to your brand voice.`,
      });
      setBulkDialogOpen(false);
      setBulkText("");
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to import samples",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSample(id);
      toast({ title: "Sample deleted" });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete sample",
        variant: "destructive",
      });
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllSamples();
      toast({ title: "All samples cleared", description: "Your brand voice has been reset." });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to clear samples",
        variant: "destructive",
      });
    }
  };

  const exportSamples = () => {
    const data = samples.map((s) => ({
      type: s.sample_type,
      content: s.content,
      context: s.context,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "brand-voice-samples.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const brandContext = getBrandContext();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Brand Voice Training
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Brand Voice Training
            </CardTitle>
            <CardDescription>
              Train AI to match your brand's tone with example responses and guidelines
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Bulk Import
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bulk Import Responses</DialogTitle>
                  <DialogDescription>
                    Paste your past responses, one per line. These will be used to train the AI.
                  </DialogDescription>
                </DialogHeader>
                <Textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder="Thank you for your feedback! We appreciate you taking the time...
We're sorry to hear about your experience. Let us make this right...
Great question! Our team is here to help..."
                  rows={10}
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleBulkImport}>Import Samples</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sample
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Brand Voice Sample</DialogTitle>
                  <DialogDescription>
                    Add examples to help AI understand your brand's communication style
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Sample Type</Label>
                    <Select
                      value={formData.sample_type}
                      onValueChange={(v) =>
                        setFormData({ ...formData, sample_type: v as BrandVoiceSample["sample_type"] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="response">Example Response</SelectItem>
                        <SelectItem value="guideline">Brand Guideline</SelectItem>
                        <SelectItem value="keyword">Key Term to Use</SelectItem>
                        <SelectItem value="phrase">Brand Phrase</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Content</Label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder={
                        formData.sample_type === "response"
                          ? "Thank you for reaching out! We appreciate your feedback..."
                          : formData.sample_type === "guideline"
                          ? "Always acknowledge the customer's concern before offering solutions"
                          : formData.sample_type === "keyword"
                          ? "partner, community, valued customer"
                          : "We're here to help!"
                      }
                      rows={4}
                    />
                  </div>

                  {formData.sample_type === "response" && (
                    <div className="space-y-2">
                      <Label>Context (optional)</Label>
                      <Input
                        value={formData.context}
                        onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                        placeholder="e.g., Responding to a complaint, Thanking for positive review"
                      />
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddSample} disabled={!formData.content}>
                    Add Sample
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Training Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <p className="text-2xl font-bold">{brandContext.totalSamples}</p>
            <p className="text-sm text-muted-foreground">Total Samples</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <p className="text-2xl font-bold">
              {samples.filter((s) => s.sample_type === "response").length}
            </p>
            <p className="text-sm text-muted-foreground">Responses</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <p className="text-2xl font-bold">
              {samples.filter((s) => s.sample_type === "guideline").length}
            </p>
            <p className="text-sm text-muted-foreground">Guidelines</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <p className="text-2xl font-bold">
              {brandContext.totalSamples >= 10 ? "Ready" : "Training"}
            </p>
            <p className="text-sm text-muted-foreground">AI Status</p>
          </div>
        </div>

        {/* Sample List */}
        {samples.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>No brand voice samples yet</p>
            <p className="text-sm">Add examples to train the AI on your brand's voice</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Training Data</h4>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportSamples}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={handleClearAll}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-auto">
              {samples.map((sample) => {
                const config = sampleTypeConfig[sample.sample_type];
                const Icon = config.icon;
                return (
                  <div
                    key={sample.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className={`p-2 rounded-md ${config.color} text-white`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {config.label}
                        </Badge>
                        {sample.context && (
                          <span className="text-xs text-muted-foreground">{sample.context}</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{sample.content}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => handleDelete(sample.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
