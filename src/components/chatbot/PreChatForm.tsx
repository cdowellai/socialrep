import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, ArrowRight } from "lucide-react";

interface PreChatFormProps {
  collectName: boolean;
  collectEmail: boolean;
  onSubmit: (data: { name?: string; email?: string }) => void;
  primaryColor?: string;
}

export function PreChatForm({
  collectName,
  collectEmail,
  onSubmit,
  primaryColor,
}: PreChatFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; email?: string } = {};

    if (collectName && !name.trim()) {
      newErrors.name = "Please enter your name";
    }

    if (collectEmail) {
      if (!email.trim()) {
        newErrors.email = "Please enter your email";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = "Please enter a valid email";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      name: collectName ? name.trim() : undefined,
      email: collectEmail ? email.trim() : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <div className="text-center mb-4">
        <p className="text-sm text-muted-foreground">
          Before we start, please tell us a bit about yourself
        </p>
      </div>

      {collectName && (
        <div className="space-y-2">
          <Label htmlFor="prechat-name" className="text-sm flex items-center gap-2">
            <User className="h-3.5 w-3.5" />
            Your Name
          </Label>
          <Input
            id="prechat-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            placeholder="John Doe"
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name}</p>
          )}
        </div>
      )}

      {collectEmail && (
        <div className="space-y-2">
          <Label htmlFor="prechat-email" className="text-sm flex items-center gap-2">
            <Mail className="h-3.5 w-3.5" />
            Your Email
          </Label>
          <Input
            id="prechat-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            placeholder="john@example.com"
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email}</p>
          )}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        style={primaryColor ? { backgroundColor: primaryColor } : undefined}
      >
        Start Chat
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </form>
  );
}
