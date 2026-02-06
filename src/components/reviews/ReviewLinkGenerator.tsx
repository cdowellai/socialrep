import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Link2,
  QrCode,
  Copy,
  Download,
  Check,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ReviewLinkGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

const platforms = [
  { value: "google", label: "Google", urlTemplate: "https://g.page/r/YOUR_PLACE_ID/review" },
  { value: "yelp", label: "Yelp", urlTemplate: "https://www.yelp.com/writeareview/biz/YOUR_BIZ_ID" },
  { value: "facebook", label: "Facebook", urlTemplate: "https://www.facebook.com/YOUR_PAGE/reviews" },
  { value: "tripadvisor", label: "TripAdvisor", urlTemplate: "https://www.tripadvisor.com/UserReviewEdit-YOUR_ID" },
  { value: "trustpilot", label: "Trustpilot", urlTemplate: "https://www.trustpilot.com/evaluate/YOUR_DOMAIN" },
];

const generateShortCode = () => {
  return Math.random().toString(36).substring(2, 8);
};

export function ReviewLinkGenerator({
  isOpen,
  onClose,
}: ReviewLinkGeneratorProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [platform, setPlatform] = useState("google");
  const [reviewUrl, setReviewUrl] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const selectedPlatform = platforms.find((p) => p.value === platform);
    if (selectedPlatform) {
      setReviewUrl(selectedPlatform.urlTemplate);
    }
  }, [platform]);

  const handleGenerate = async () => {
    if (!user || !reviewUrl) return;

    setGenerating(true);
    try {
      const code = generateShortCode();
      setShortCode(code);

      // Store in database
      const { error } = await supabase.from("review_links").insert({
        user_id: user.id,
        platform,
        review_url: reviewUrl,
        short_code: code,
      });

      if (error) throw error;

      // Generate the short link (in production, this would be your domain)
      const shortLink = `${window.location.origin}/r/${code}`;
      setGeneratedLink(shortLink);

      toast({
        title: "Link generated",
        description: "Your review link has been created successfully.",
      });
    } catch (error) {
      console.error("Error generating link:", error);
      toast({
        title: "Error",
        description: "Failed to generate review link",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById("review-qr-code");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = `review-qr-${platform}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Generate Review Link
          </DialogTitle>
          <DialogDescription>
            Create a short URL and QR code for customers to leave reviews.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Platform Selection */}
          <div className="space-y-2">
            <Label>Review Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
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

          {/* Review URL Input */}
          <div className="space-y-2">
            <Label>Review Page URL</Label>
            <Input
              value={reviewUrl}
              onChange={(e) => setReviewUrl(e.target.value)}
              placeholder="Enter your review page URL"
            />
            <p className="text-xs text-muted-foreground">
              Replace the placeholder with your actual business ID or page URL.
            </p>
          </div>

          {/* Generate Button */}
          {!generatedLink && (
            <Button
              onClick={handleGenerate}
              disabled={!reviewUrl || generating}
              className="w-full"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Link2 className="h-4 w-4 mr-2" />
              )}
              Generate Review Link
            </Button>
          )}

          {/* Generated Link Display */}
          {generatedLink && (
            <Tabs defaultValue="link" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="link">
                  <Link2 className="h-4 w-4 mr-2" />
                  Short Link
                </TabsTrigger>
                <TabsTrigger value="qr">
                  <QrCode className="h-4 w-4 mr-2" />
                  QR Code
                </TabsTrigger>
              </TabsList>

              <TabsContent value="link" className="space-y-4">
                <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50">
                  <Input
                    value={generatedLink}
                    readOnly
                    className="flex-1 border-0 bg-transparent focus-visible:ring-0"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-sentiment-positive" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => window.open(reviewUrl, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Share this link with customers to collect reviews
                </p>
              </TabsContent>

              <TabsContent value="qr" className="space-y-4">
                <div className="flex flex-col items-center gap-4 p-4 rounded-lg border bg-white">
                  <QRCodeSVG
                    id="review-qr-code"
                    value={generatedLink}
                    size={200}
                    level="H"
                    includeMargin
                  />
                  <p className="text-sm text-muted-foreground text-center">
                    Scan to leave a review on {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleDownloadQR}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download QR Code
                </Button>
              </TabsContent>
            </Tabs>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {generatedLink && (
            <Button
              onClick={() => {
                setGeneratedLink("");
                setShortCode("");
              }}
            >
              Generate New Link
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
