import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; tab: "login" | "signup" }>({
    isOpen: false,
    tab: "login",
  });
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#integrations", label: "Integrations" },
    { href: "#pricing", label: "Pricing" },
  ];

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-700",
          isScrolled
            ? "bg-[#0a0a0f]/80 backdrop-blur-2xl border-b border-white/[0.06]"
            : "bg-transparent"
        )}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-white/10 border border-white/[0.08] flex items-center justify-center">
                <MessageSquare className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-bold text-[15px] text-white">SocialRep</span>
            </Link>

            <div className="hidden md:flex items-center gap-7">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                  className="text-[13px] text-white/50 hover:text-white/90 transition-colors duration-300"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/5 text-[13px] h-8" asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/5 text-[13px] h-8" onClick={() => signOut()}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/60 hover:text-white hover:bg-white/5 text-[13px] h-8"
                    onClick={() => setAuthModal({ isOpen: true, tab: "login" })}
                  >
                    Log in
                  </Button>
                  <button
                    className="h-8 px-4 rounded-full bg-white text-[#0a0a0f] text-[13px] font-semibold hover:bg-white/90 transition-all duration-200"
                    onClick={() => {
                      document.querySelector("#pricing")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>

            <Button variant="ghost" size="icon" className="md:hidden text-white h-8 w-8" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-white/[0.06] bg-[#0a0a0f]/95 backdrop-blur-2xl">
            <div className="max-w-6xl mx-auto px-6 py-6 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block text-sm text-white/60 hover:text-white"
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 border-t border-white/[0.06] space-y-2">
                {user ? (
                  <>
                    <Button variant="outline" className="w-full border-white/10 text-white" asChild>
                      <Link to="/dashboard">Dashboard</Link>
                    </Button>
                    <Button variant="ghost" className="w-full text-white/60" onClick={() => signOut()}>
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      className="w-full text-white/60"
                      onClick={() => { setAuthModal({ isOpen: true, tab: "login" }); setIsMenuOpen(false); }}
                    >
                      Log in
                    </Button>
                    <button
                      className="w-full h-10 rounded-full bg-white text-[#0a0a0f] text-sm font-semibold"
                      onClick={() => { document.querySelector("#pricing")?.scrollIntoView({ behavior: "smooth" }); setIsMenuOpen(false); }}
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      <AuthModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        defaultTab={authModal.tab}
      />
    </>
  );
}
