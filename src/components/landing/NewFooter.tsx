import { Link } from "react-router-dom";
import { MessageCircle, Twitter } from "lucide-react";

export function NewFooter() {
  const links = [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Contact", href: "#" },
  ];

  return (
    <footer className="py-8 border-t border-border bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-accent flex items-center justify-center">
              <MessageCircle className="h-3.5 w-3.5 text-background" />
            </div>
            <span className="font-bold">SocialRep</span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-6">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-foreground-muted hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="https://twitter.com/SocialRepAI"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground-muted hover:text-foreground transition-colors"
            >
              <Twitter className="h-4 w-4" />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-sm text-foreground-muted">
            © {new Date().getFullYear()} SocialRep. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
