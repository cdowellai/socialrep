import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";

export function Footer() {
  const links = [
    { href: "#", label: "Privacy" },
    { href: "#", label: "Terms" },
    { href: "#", label: "Contact" },
    { href: "#", label: "Twitter" },
  ];

  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <MessageCircle className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold">SocialRep</span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-6">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SocialRep. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
