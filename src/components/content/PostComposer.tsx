import { useState } from "react";
import { useScheduledPosts, CreatePostInput } from "@/hooks/useScheduledPosts";
import { useSubscription } from "@/hooks/useSubscription";
import { useInteractions } from "@/hooks/useInteractions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import { format, addHours } from "date-fns";
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Sparkles,
  Calendar as CalendarIcon,
  Clock,
  Send,
  Save,
  Image,
  Link,
  Loader2,
  TrendingUp,
  Users,
  MessageSquare,
  Share2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Platform icon map
const platformIcons: Record<string, React.ElementType> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  tiktok: () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
  ),
};

const platforms = [
  { id: "facebook", name: "Facebook", color: "bg-blue-600" },
  { id: "instagram", name: "Instagram", color: "bg-gradient-to-r from-purple-500 to-pink-500" },
  { id: "twitter", name: "X / Twitter", color: "bg-black dark:bg-white dark:text-black" },
  { id: "linkedin", name: "LinkedIn", color: "bg-blue-700" },
  { id: "tiktok", name: "TikTok", color: "bg-black dark:bg-white dark:text-black" },
];

interface PredictedEngagement {
  likes?: number;
  comments?: number;
  shares?: number;
  reach?: number;
  confidence?: number;
  reasoning?: string;
}

export function PostComposer() {
  const { createPost, usage } = useScheduledPosts();
  const { plan } = useSubscription();
  const { interactions } = useInteractions();
  const { toast } = useToast();

  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [linkUrl, setLinkUrl] = useState("");
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const [scheduledTime, setScheduledTime] = useState("12:00");
  const [optimalTimeEnabled, setOptimalTimeEnabled] = useState(false);
  const [approvalRequired, setApprovalRequired] = useState(false);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [predictedEngagement, setPredictedEngagement] = useState<PredictedEngagement | null>(null);
  const [showSourcePicker, setShowSourcePicker] = useState(false);

  // Usage limits - default based on plan name
  const getMaxPosts = () => {
    if (!plan) return 5;
    if (plan.name === "agency") return -1; // Unlimited
    if (plan.name === "professional") return 50;
    return 5; // Starter/Free
  };
  const maxPosts = getMaxPosts();
  const postsUsed = usage?.posts_used || 0;
  const postsRemaining = maxPosts === -1 ? Infinity : maxPosts - postsUsed;
  const usagePercent = maxPosts === -1 ? 0 : (postsUsed / maxPosts) * 100;

  // Positive interactions for AI draft
  const positiveInteractions = interactions.filter(
    (i) => i.sentiment === "positive" && !i.resolved
  );

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    );
  };

  const generateAIDraft = async (sourceInteraction?: typeof interactions[0]) => {
    setIsGeneratingDraft(true);
    try {
      const { data, error } = await supabase.functions.invoke("content-ai", {
        body: {
          action: "generate_draft",
          platforms: selectedPlatforms.length > 0 ? selectedPlatforms : ["twitter"],
          source_interaction: sourceInteraction
            ? {
                content: sourceInteraction.content,
                platform: sourceInteraction.platform,
                sentiment: sourceInteraction.sentiment,
                author_name: sourceInteraction.author_name,
              }
            : undefined,
          content: content || undefined,
        },
      });

      if (error) throw error;
      
      setContent(data.content || data);
      setShowSourcePicker(false);
      toast({
        title: "Draft generated",
        description: "AI has created a draft based on your input",
      });
    } catch (error) {
      console.error("Error generating draft:", error);
      toast({
        title: "Error",
        description: "Failed to generate AI draft",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const predictEngagement = async () => {
    if (!content.trim()) return;
    
    setIsPredicting(true);
    try {
      const { data, error } = await supabase.functions.invoke("content-ai", {
        body: {
          action: "predict_engagement",
          content,
          platforms: selectedPlatforms,
        },
      });

      if (error) throw error;
      
      setPredictedEngagement(data);
    } catch (error) {
      console.error("Error predicting engagement:", error);
      toast({
        title: "Error",
        description: "Failed to predict engagement",
        variant: "destructive",
      });
    } finally {
      setIsPredicting(false);
    }
  };

  const handleSubmit = async (asDraft: boolean) => {
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please write some content for your post",
        variant: "destructive",
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "Platform required",
        description: "Please select at least one platform",
        variant: "destructive",
      });
      return;
    }

    if (!asDraft && postsRemaining <= 0 && maxPosts !== -1) {
      toast({
        title: "Post limit reached",
        description: `You've used all ${maxPosts} posts this month. Upgrade to post more.`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let scheduledFor: string | null = null;
      if (!asDraft && scheduledDate) {
        const [hours, minutes] = scheduledTime.split(":").map(Number);
        const dateTime = new Date(scheduledDate);
        dateTime.setHours(hours, minutes, 0, 0);
        scheduledFor = dateTime.toISOString();
      }

      const input: CreatePostInput = {
        content,
        platforms: selectedPlatforms,
        link_url: linkUrl || null,
        scheduled_for: scheduledFor,
        optimal_time_enabled: optimalTimeEnabled,
        approval_required: approvalRequired,
        predicted_engagement: predictedEngagement ? { ...predictedEngagement } : undefined,
        status: asDraft ? "draft" : approvalRequired ? "pending_approval" : "scheduled",
      };

      const result = await createPost(input);
      if (result) {
        // Reset form
        setContent("");
        setSelectedPlatforms([]);
        setLinkUrl("");
        setScheduledDate(undefined);
        setScheduledTime("12:00");
        setOptimalTimeEnabled(false);
        setApprovalRequired(false);
        setPredictedEngagement(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main composer */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Create Post</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSourcePicker(true)}
                disabled={isGeneratingDraft}
              >
                {isGeneratingDraft ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                AI Draft
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Platform selection */}
            <div className="space-y-2">
              <Label>Platforms</Label>
              <div className="flex flex-wrap gap-2">
                {platforms.map((platform) => {
                  const Icon = platformIcons[platform.id];
                  const isSelected = selectedPlatforms.includes(platform.id);
                  return (
                    <Button
                      key={platform.id}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => togglePlatform(platform.id)}
                      className={cn(
                        "gap-2",
                        isSelected && platform.color
                      )}
                    >
                      <Icon />
                      {platform.name}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Content textarea */}
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                placeholder="What do you want to share?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{content.length} characters</span>
                {selectedPlatforms.includes("twitter") && content.length > 280 && (
                  <span className="text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Exceeds X character limit
                  </span>
                )}
              </div>
            </div>

            {/* Link URL */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                Link (optional)
              </Label>
              <Input
                type="url"
                placeholder="https://..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>

            {/* Media upload placeholder */}
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <Image className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Drag and drop images or videos, or click to upload
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Media upload coming soon
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Scheduling */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !scheduledDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={setScheduledDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Time</Label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Select value={scheduledTime} onValueChange={setScheduledTime}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, "0");
                        return (
                          <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                            {`${hour}:00`}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Use AI optimal time</Label>
                <p className="text-sm text-muted-foreground">
                  Let AI pick the best posting time based on your audience
                </p>
              </div>
              <Switch
                checked={optimalTimeEnabled}
                onCheckedChange={setOptimalTimeEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require approval</Label>
                <p className="text-sm text-muted-foreground">
                  Team admin must approve before publishing
                </p>
              </div>
              <Switch
                checked={approvalRequired}
                onCheckedChange={setApprovalRequired}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Monthly Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Posts used</span>
                <span className="font-medium">
                  {postsUsed} / {maxPosts === -1 ? "∞" : maxPosts}
                </span>
              </div>
              {maxPosts !== -1 && (
                <Progress value={usagePercent} className="h-2" />
              )}
              {postsRemaining <= 0 && maxPosts !== -1 && (
                <p className="text-xs text-destructive">
                  Upgrade your plan to schedule more posts
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Engagement prediction */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Predicted Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            {predictedEngagement ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 rounded-lg bg-accent/50">
                    <div className="text-lg font-bold">
                      {predictedEngagement.likes?.toLocaleString() || "—"}
                    </div>
                    <div className="text-xs text-muted-foreground">Likes</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-accent/50">
                    <div className="text-lg font-bold">
                      {predictedEngagement.comments?.toLocaleString() || "—"}
                    </div>
                    <div className="text-xs text-muted-foreground">Comments</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-accent/50">
                    <div className="text-lg font-bold">
                      {predictedEngagement.shares?.toLocaleString() || "—"}
                    </div>
                    <div className="text-xs text-muted-foreground">Shares</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-accent/50">
                    <div className="text-lg font-bold">
                      {predictedEngagement.reach?.toLocaleString() || "—"}
                    </div>
                    <div className="text-xs text-muted-foreground">Reach</div>
                  </div>
                </div>
                {predictedEngagement.confidence && (
                  <div className="text-xs text-center text-muted-foreground">
                    {predictedEngagement.confidence}% confidence
                  </div>
                )}
                {predictedEngagement.reasoning && (
                  <p className="text-xs text-muted-foreground">
                    {predictedEngagement.reasoning}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={predictEngagement}
                  disabled={!content.trim() || isPredicting}
                >
                  {isPredicting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Predict Performance
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Get AI-powered engagement predictions
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            className="w-full"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting || !content.trim() || selectedPlatforms.length === 0}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : scheduledDate ? (
              <CalendarIcon className="h-4 w-4 mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {scheduledDate ? "Schedule Post" : "Post Now"}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting || !content.trim()}
          >
            <Save className="h-4 w-4 mr-2" />
            Save as Draft
          </Button>
        </div>
      </div>

      {/* Source interaction picker dialog */}
      <Dialog open={showSourcePicker} onOpenChange={setShowSourcePicker}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate AI Draft</DialogTitle>
            <DialogDescription>
              Choose a positive interaction to turn into a social post, or generate from scratch.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => generateAIDraft()}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate from scratch
            </Button>
            
            {positiveInteractions.length > 0 && (
              <>
                <div className="text-sm font-medium">Or use a positive interaction:</div>
                {positiveInteractions.slice(0, 5).map((interaction) => (
                  <Button
                    key={interaction.id}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3"
                    onClick={() => generateAIDraft(interaction)}
                  >
                    <div className="flex flex-col items-start gap-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {interaction.platform}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {interaction.author_name || interaction.author_handle}
                        </span>
                      </div>
                      <p className="text-sm line-clamp-2">{interaction.content}</p>
                    </div>
                  </Button>
                ))}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
