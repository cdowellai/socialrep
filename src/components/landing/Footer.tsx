import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-10 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-2.5 w-2.5 text-primary" />
            </div>
            <span className="text-[13px] text-muted-foreground">
              © 2026 SocialRep
            </span>
          </div>
          <div className="flex items-center gap-6 text-[13px] text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="/data-deletion" className="hover:text-foreground transition-colors">Data Deletion</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
