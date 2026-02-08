import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";

export function Footer() {
  const links = [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Twitter", href: "#" },
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo + Copyright */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-gradient-primary flex items-center justify-center">
                <MessageSquare className="h-3 w-3 text-primary-foreground" />
              </div>
              <span className="font-bold text-sm">SocialRep</span>
            </Link>
            <span className="text-sm text-muted-foreground">
              © 2026 SocialRep. All rights reserved.
            </span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-6">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
