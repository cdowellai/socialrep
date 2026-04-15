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
          isScrolled ? "py-2" : "py-0"
        )}
      >
        <div
          className={cn(
            "transition-all duration-700 mx-auto",
            isScrolled
              ? "max-w-3xl bg-white/[0.06] backdrop-blur-2xl border border-white/[0.08] rounded-full shadow-[0_4px_40px_-8px_rgba(0,0,0,0.5)]"
              : "max-w-7xl bg-transparent"
          )}
        >
          <div className={cn(
            "flex items-center justify-between",
            isScrolled ? "h-12 px-5" : "h-16 px-6"
          )}>
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className={cn(
                "rounded-xl bg-gradient-to-br from-[#4338ca] to-[#7c3aed] flex items-center justify-center shadow-[0_0_20px_-4px_rgba(99,102,241,0.3)] group-hover:shadow-[0_0_28px_-4px_rgba(99,102,241,0.4)] transition-all duration-500",
                isScrolled ? "h-7 w-7" : "h-8 w-8"
              )}>
                <MessageSquare className={cn("text-white", isScrolled ? "h-3.5 w-3.5" : "h-4 w-4")} />
              </div>
              <span className={cn(
                "font-bold text-white tracking-[-0.01em] transition-all duration-500",
                isScrolled ? "text-[14px]" : "text-[16px]"
              )}>SocialRep</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                  className="text-[13px] text-white/55 hover:text-white transition-colors duration-400 font-medium"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/5 text-[13px] h-9 font-medium" asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/5 text-[13px] h-9 font-medium" onClick={() => signOut()}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/60 hover:text-white hover:bg-white/5 text-[13px] h-9 font-medium"
                    onClick={() => setAuthModal({ isOpen: true, tab: "login" })}
                  >
                    Sign in
                  </Button>
                  <button
                    className={cn(
                      "rounded-full bg-white text-[#06060a] font-semibold transition-all duration-300 border border-white/10",
                      isScrolled
                        ? "h-8 px-4 text-[12px] hover:shadow-[0_0_20px_-6px_rgba(255,255,255,0.15)]"
                        : "h-9 px-5 text-[13px] hover:shadow-[0_0_24px_-6px_rgba(255,255,255,0.15)]"
                    )}
                    onClick={() => document.querySelector("#pricing")?.scrollIntoView({ behavior: "smooth" })}
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>

            <Button variant="ghost" size="icon" className="md:hidden text-white h-9 w-9" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 top-0 bg-[#06060a]/95 backdrop-blur-3xl z-40 flex flex-col items-center justify-center">
            <button className="absolute top-5 right-5 text-white/60 hover:text-white p-2" onClick={() => setIsMenuOpen(false)}>
              <X className="h-5 w-5" />
            </button>
            <div className="space-y-8 text-center">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block text-[18px] text-white/70 hover:text-white font-medium"
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-8 border-t border-white/[0.06] space-y-4">
                {user ? (
                  <>
                    <Button variant="outline" className="w-48 border-white/10 text-white" asChild>
                      <Link to="/dashboard">Dashboard</Link>
                    </Button>
                    <Button variant="ghost" className="w-48 text-white/60" onClick={() => signOut()}>
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      className="w-48 text-white/60"
                      onClick={() => { setAuthModal({ isOpen: true, tab: "login" }); setIsMenuOpen(false); }}
                    >
                      Sign in
                    </Button>
                    <button
                      className="w-48 h-11 rounded-full bg-white text-[#06060a] text-[14px] font-semibold"
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
