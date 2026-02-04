import { Facebook, Instagram, Youtube, Linkedin, Star, Building2, ThumbsUp, Plus } from "lucide-react";

const socialPlatforms = [
  { name: "Facebook", icon: Facebook, color: "text-[#1877F2]" },
  { name: "Instagram", icon: Instagram, color: "text-[#E4405F]" },
  { name: "TikTok", icon: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  ), color: "text-foreground" },
  { name: "YouTube", icon: Youtube, color: "text-[#FF0000]" },
  { name: "LinkedIn", icon: Linkedin, color: "text-[#0A66C2]" },
];

const reviewPlatforms = [
  { name: "Google Business", icon: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  ), color: "" },
  { name: "Trustpilot", icon: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#00B67A">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
  ), color: "" },
  { name: "Yelp", icon: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#FF1A1A">
      <path d="M21.111 18.226c-.141.969-2.119 3.483-2.8 3.551-.68.068-.814-.529-1.154-1.112l-1.503-2.549c-.274-.465-.25-.635.072-.854.322-.219.616-.162 1.056.18l2.129 1.654c.409.318.341.161.2 1.13zm-3.697-5.139l2.852-.404c.54-.076.636-.118.761-.016.51.415 1.152 3.31.886 3.85-.266.54-.653.552-1.087.428l-2.824-.812c-.587-.168-.632-.42-.557-.909.076-.49.382-.061.969-.137zm-3.199-9.115c.09-.74.295-.847.679-.967 1.044-.326 3.884.46 4.039 1.135.155.675-.392.964-.762 1.288l-2.07 1.826c-.443.391-.607.281-.935-.064-.329-.346-.041-.478.049-1.218zm-2.043 5.729c.242-.065.362.054.434.263l2.12 6.078c.159.455.077.7-.271.966-.348.265-.615.124-1.017-.144l-5.605-3.74c-.363-.243-.513-.561-.334-1.134.178-.573.572-.62.946-.62l3.727.331zm-3.285 6.569c-.518-.124-.624-.298-.522-.811l.641-3.243c.142-.72.314-.821.764-.873.45-.052.675.203.848.664l1.19 3.195c.204.547.101.727-.313.889-.414.162-.577-.02-1.074-.167l-1.534-.654zM8.583 8.258l.696-3.362c.153-.74.263-.881.679-.881.857 0 3.275 2.209 3.275 2.975s-.37.766-.751.822l-3.046.44c-.541.078-.707.006-.853-.995z"/>
    </svg>
  ), color: "" },
  { name: "BBB", icon: Building2, color: "text-[#005A9C]" },
  { name: "Facebook Reviews", icon: ThumbsUp, color: "text-[#1877F2]" },
  { name: "More", icon: Plus, color: "text-muted-foreground" },
];

export function IntegrationsSection() {
  return (
    <section id="integrations" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block text-sm font-medium text-primary mb-3 animate-fade-in">
            Integrations
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Connects to the platforms you already use
          </h2>
          <p className="text-lg text-muted-foreground animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Comments, DMs, and reviews—all in one dashboard.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Social Platforms */}
          <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <h3 className="text-sm font-medium text-muted-foreground text-center mb-4">Social Platforms</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {socialPlatforms.map((platform, index) => {
                const IconComponent = platform.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 hover:border-primary/50 transition-colors"
                  >
                    <IconComponent className={`w-4 h-4 ${platform.color}`} />
                    <span className="font-medium text-sm">{platform.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review Platforms */}
          <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <h3 className="text-sm font-medium text-muted-foreground text-center mb-4">Review Platforms</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {reviewPlatforms.map((platform, index) => {
                const IconComponent = platform.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 hover:border-primary/50 transition-colors"
                  >
                    <IconComponent className={`w-4 h-4 ${platform.color}`} />
                    <span className="font-medium text-sm">{platform.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
