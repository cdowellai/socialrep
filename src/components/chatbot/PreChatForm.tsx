import { useState } from "react";
import { Button } from "@/components/ui/button";
import { User, Mail, ArrowRight, Sparkles } from "lucide-react";

interface PreChatFormProps {
  collectName: boolean;
  collectEmail: boolean;
  onSubmit: (data: { name?: string; email?: string }) => void;
  primaryColor?: string;
}

export function PreChatForm({ collectName, collectEmail, onSubmit, primaryColor }: PreChatFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const accentColor = primaryColor || "hsl(var(--primary))";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; email?: string } = {};

    if (collectName && !name.trim()) newErrors.name = "Please enter your name";
    if (collectEmail) {
      if (!email.trim()) newErrors.email = "Please enter your email";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Please enter a valid email";
    }

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    onSubmit({
      name: collectName ? name.trim() : undefined,
      email: collectEmail ? email.trim() : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="text-center mb-6">
        <div className="h-12 w-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: accentColor }}>
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-base font-semibold tracking-tight">Before we chat</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Tell us a bit about yourself so we can help you better.
        </p>
      </div>

      <div className="space-y-4">
        {collectName && (
          <div>
            <label htmlFor="prechat-name" className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <User className="h-3 w-3" /> Your Name
            </label>
            <input
              id="prechat-name"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
              placeholder="John Doe"
              className={`w-full bg-muted/50 border-0 rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 ${errors.name ? "ring-2 ring-destructive/50" : ""}`}
            />
            {errors.name && <p className="text-xs text-destructive mt-1.5">{errors.name}</p>}
          </div>
        )}

        {collectEmail && (
          <div>
            <label htmlFor="prechat-email" className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Mail className="h-3 w-3" /> Email Address
            </label>
            <input
              id="prechat-email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
              placeholder="john@example.com"
              className={`w-full bg-muted/50 border-0 rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 ${errors.email ? "ring-2 ring-destructive/50" : ""}`}
            />
            {errors.email && <p className="text-xs text-destructive mt-1.5">{errors.email}</p>}
          </div>
        )}
      </div>

      <button
        type="submit"
        className="w-full mt-6 h-11 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
        style={{ backgroundColor: accentColor }}
      >
        Start Chat
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
