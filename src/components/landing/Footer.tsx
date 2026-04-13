import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-10 bg-[#06060a]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-[#4338ca] to-[#7c3aed] flex items-center justify-center">
              <MessageSquare className="h-3 w-3 text-white" />
            </div>
            <span className="text-[13px] text-white/40">
              © 2026 SocialRep
            </span>
          </div>
          <div className="flex items-center gap-8 text-[13px] text-white/40">
            <Link to="/privacy" className="hover:text-white/70 transition-colors duration-300">Privacy</Link>
            <Link to="/terms" className="hover:text-white/70 transition-colors duration-300">Terms</Link>
            <Link to="/data-deletion" className="hover:text-white/70 transition-colors duration-300">Data Deletion</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}