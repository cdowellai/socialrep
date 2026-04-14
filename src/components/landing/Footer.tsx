import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";

const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
  e.preventDefault();
  document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
};

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-16 bg-[#06060a]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-[#4338ca] to-[#7c3aed] flex items-center justify-center">
                <MessageSquare className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-bold text-[15px] text-white tracking-[-0.01em]">SocialRep</span>
            </div>
            <p className="text-[13px] text-white/40 leading-relaxed max-w-[220px]">
              AI-powered reputation management for modern businesses.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-white/50 mb-4">Product</h4>
            <ul className="space-y-2.5">
              <li><a href="#features" onClick={(e) => handleSmoothScroll(e, "#features")} className="text-[13px] text-white/40 hover:text-white/70 transition-colors duration-300">Features</a></li>
              <li><a href="#integrations" onClick={(e) => handleSmoothScroll(e, "#integrations")} className="text-[13px] text-white/40 hover:text-white/70 transition-colors duration-300">Integrations</a></li>
              <li><a href="#pricing" onClick={(e) => handleSmoothScroll(e, "#pricing")} className="text-[13px] text-white/40 hover:text-white/70 transition-colors duration-300">Pricing</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-white/50 mb-4">Company</h4>
            <ul className="space-y-2.5">
              <li><Link to="/privacy" className="text-[13px] text-white/40 hover:text-white/70 transition-colors duration-300">Privacy</Link></li>
              <li><Link to="/terms" className="text-[13px] text-white/40 hover:text-white/70 transition-colors duration-300">Terms</Link></li>
              <li><Link to="/data-deletion" className="text-[13px] text-white/40 hover:text-white/70 transition-colors duration-300">Data Deletion</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-white/50 mb-4">Support</h4>
            <ul className="space-y-2.5">
              <li><a href="#faq" onClick={(e) => handleSmoothScroll(e, "#faq")} className="text-[13px] text-white/40 hover:text-white/70 transition-colors duration-300">FAQ</a></li>
              <li><a href="mailto:support@socialrep.ai" className="text-[13px] text-white/40 hover:text-white/70 transition-colors duration-300">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-8">
          <p className="text-[12px] text-white/30">
            © 2026 SocialRep. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
