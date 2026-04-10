import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-lg bg-primary flex items-center justify-center">
              <MessageSquare className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="text-sm text-muted-foreground">
              © 2026 SocialRep. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="/data-deletion" className="hover:text-foreground transition-colors">Data Deletion</Link>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
