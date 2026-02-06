import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Mail,
  Phone,
  Send,
  Upload,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ReviewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName?: string;
}

interface Recipient {
  email?: string;
  phone?: string;
  status: "pending" | "sent" | "failed";
}

const defaultEmailTemplate = `Hi there,

Thank you for choosing {{business_name}}! We hope you had a great experience with us.

We'd love to hear your feedback. Would you take a moment to leave us a review? It only takes a minute and helps us improve our service.

Click here to leave a review:
{{review_link}}

Thank you for your support!

Best regards,
The {{business_name}} Team`;

const defaultSmsTemplate = `Thanks for choosing {{business_name}}! We'd love your feedback. Please leave us a review: {{review_link}}`;

export function ReviewRequestModal({
  isOpen,
  onClose,
  businessName = "Our Business",
}: ReviewRequestModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"email" | "sms">("email");
  const [platform, setPlatform] = useState("google");
  const [emailTemplate, setEmailTemplate] = useState(defaultEmailTemplate);
  const [smsTemplate, setSmsTemplate] = useState(defaultSmsTemplate);
  const [recipientInput, setRecipientInput] = useState("");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [sending, setSending] = useState(false);

  const parseRecipients = useCallback((input: string, type: "email" | "sms") => {
    const items = input
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const parsed: Recipient[] = items.map((item) => ({
      ...(type === "email" ? { email: item } : { phone: item }),
      status: "pending" as const,
    }));

    setRecipients(parsed);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRecipientInput(text);
      parseRecipients(text, activeTab);
    };
    reader.readAsText(file);
  };

  const handleSendRequests = async () => {
    if (!user || recipients.length === 0) return;

    setSending(true);
    const template = activeTab === "email" ? emailTemplate : smsTemplate;
    const reviewLink = `https://example.com/review/${platform}/${user.id}`; // Placeholder

    const processedTemplate = template
      .replace(/\{\{business_name\}\}/g, businessName)
      .replace(/\{\{review_link\}\}/g, reviewLink);

    try {
      const requests = recipients.map((r) => ({
        user_id: user.id,
        recipient_email: r.email || null,
        recipient_phone: r.phone || null,
        message_template: processedTemplate,
        platform,
        status: "sent",
        sent_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from("review_requests").insert(requests);

      if (error) throw error;

      // Update local status
      setRecipients((prev) =>
        prev.map((r) => ({ ...r, status: "sent" as const }))
      );

      toast({
        title: "Requests sent",
        description: `Successfully sent ${recipients.length} review request${recipients.length > 1 ? "s" : ""}.`,
      });

      setTimeout(() => {
        onClose();
        setRecipients([]);
        setRecipientInput("");
      }, 1500);
    } catch (error) {
      console.error("Error sending review requests:", error);
      setRecipients((prev) =>
        prev.map((r) => ({ ...r, status: "failed" as const }))
      );
      toast({
        title: "Error",
        description: "Failed to send review requests",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const sentCount = recipients.filter((r) => r.status === "sent").length;
  const failedCount = recipients.filter((r) => r.status === "failed").length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Request Reviews
          </DialogTitle>
          <DialogDescription>
            Send personalized review requests to your customers via email or SMS.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "email" | "sms")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="sms">
              <Phone className="h-4 w-4 mr-2" />
              SMS
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-4">
            {/* Platform Selection */}
            <div className="space-y-2">
              <Label>Review Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="yelp">Yelp</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="tripadvisor">TripAdvisor</SelectItem>
                  <SelectItem value="trustpilot">Trustpilot</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Message Template */}
            <TabsContent value="email" className="m-0">
              <div className="space-y-2">
                <Label>Email Template</Label>
                <Textarea
                  value={emailTemplate}
                  onChange={(e) => setEmailTemplate(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Use {"{{business_name}}"} and {"{{review_link}}"} as placeholders.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="sms" className="m-0">
              <div className="space-y-2">
                <Label>SMS Template</Label>
                <Textarea
                  value={smsTemplate}
                  onChange={(e) => setSmsTemplate(e.target.value)}
                  rows={3}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Use {"{{business_name}}"} and {"{{review_link}}"} as placeholders.
                  Max 160 characters recommended.
                </p>
              </div>
            </TabsContent>

            {/* Recipients Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>
                  {activeTab === "email" ? "Email Addresses" : "Phone Numbers"}
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload CSV
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
              <Textarea
                value={recipientInput}
                onChange={(e) => {
                  setRecipientInput(e.target.value);
                  parseRecipients(e.target.value, activeTab);
                }}
                placeholder={
                  activeTab === "email"
                    ? "Enter email addresses, separated by commas or new lines"
                    : "Enter phone numbers, separated by commas or new lines"
                }
                rows={3}
              />
              {recipients.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  {recipients.length} recipient{recipients.length > 1 ? "s" : ""} ready
                </div>
              )}
            </div>

            {/* Recipient Status List */}
            {recipients.length > 0 && sending && (
              <ScrollArea className="h-32 rounded-lg border p-2">
                <div className="space-y-1">
                  {recipients.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm py-1 px-2 rounded hover:bg-muted/50"
                    >
                      <span className="truncate">
                        {r.email || r.phone}
                      </span>
                      <Badge
                        variant={
                          r.status === "sent"
                            ? "default"
                            : r.status === "failed"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {r.status === "sent" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {r.status === "failed" && <XCircle className="h-3 w-3 mr-1" />}
                        {r.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                        {r.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </Tabs>

        <DialogFooter className="pt-4 border-t">
          <div className="flex items-center gap-4 flex-1 text-sm text-muted-foreground">
            {sentCount > 0 && (
              <span className="text-sentiment-positive">
                {sentCount} sent
              </span>
            )}
            {failedCount > 0 && (
              <span className="text-sentiment-negative">
                {failedCount} failed
              </span>
            )}
          </div>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSendRequests}
            disabled={recipients.length === 0 || sending}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send {recipients.length > 0 ? recipients.length : ""} Request{recipients.length !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
