import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { MessageCircle, Menu, X } from "lucide-react";

export function NewNavbar() {
  const [authModal, setAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const openAuth = (tab: "login" | "signup") => {
    setAuthTab(tab);
    setAuthModal(true);
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#integrations", label: "Integrations" },
    { href: "#pricing", label: "Pricing" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-accent flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-background" />
              </div>
              <span className="font-bold text-lg">SocialRep</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                className="text-foreground-secondary hover:text-foreground"
                onClick={() => openAuth("login")}
              >
                Log in
              </Button>
              <Button
                className="btn-gradient"
                onClick={() => openAuth("signup")}
              >
                Start Free Trial
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="container mx-auto px-4 py-4 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block text-foreground-secondary hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 border-t border-border space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-center"
                  onClick={() => openAuth("login")}
                >
                  Log in
                </Button>
                <Button
                  className="w-full btn-gradient"
                  onClick={() => openAuth("signup")}
                >
                  Start Free Trial
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <AuthModal
        isOpen={authModal}
        onClose={() => setAuthModal(false)}
        defaultTab={authTab}
      />
    </>
  );
}
