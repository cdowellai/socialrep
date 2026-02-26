import { ReactNode, useEffect, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useTheme } from "@/hooks/useTheme";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  MessageSquare,
  Star,
  Users,
  BarChart3,
  Settings,
  Moon,
  Sun,
  LogOut,
  ChevronRight,
  Bell,
  Bot,
  PenLine,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StreamsSidebarMenu } from "@/components/sidebar/StreamsSidebarMenu";
import { OnboardingTour } from "@/components/onboarding";

// Tour target IDs for onboarding
const tourTargets: Record<string, string> = {
  "/dashboard": "overview",
  "/dashboard/inbox": "smart-inbox",
  "/dashboard/content": "content",
  "/dashboard/reviews": "reviews",
  "/dashboard/leads": "leads",
  "/dashboard/analytics": "analytics",
  "/dashboard/settings": "settings",
};

const sidebarLinks = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview", tourId: "overview" },
  { href: "/dashboard/inbox", icon: MessageSquare, label: "Smart Inbox", tourId: "smart-inbox" },
  // Streams is handled separately with StreamsSidebarMenu
  { href: "/dashboard/content", icon: PenLine, label: "Content", tourId: "content" },
  { href: "/dashboard/reviews", icon: Star, label: "Reviews", tourId: "reviews" },
  { href: "/dashboard/leads", icon: Users, label: "Leads", tourId: "leads" },
  { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics", tourId: "analytics" },
  { href: "/dashboard/chatbot", icon: Bot, label: "Chatbot" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings", tourId: "settings" },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { theme, toggleTheme } = useTheme();
  const { plan, subscription } = useSubscription();

  // FIX: Use a dedicated real-time pending count instead of loading all interactions
  const [pendingCount, setPendingCount] = useState(0);
  const planLabel = plan ? `${plan.display_name} Plan` : "Free Plan";

  // FIX: Fetch pending count directly from DB (efficient count query)
  // Only count interactions from currently connected platforms
  const fetchPendingCount = useCallback(async () => {
    if (!user) {
      setPendingCount(0);
      return;
    }
    // First get connected platforms to avoid counting orphaned messages
    const { data: platformData } = await supabase
      .from("connected_platforms")
      .select("platform")
      .eq("user_id", user.id);
    const platforms = (platformData || []).map((p) => p.platform);
    if (platforms.length === 0) {
      setPendingCount(0);
      return;
    }
    const { count } = await supabase
      .from("interactions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "pending")
      .in("platform", platforms);
    setPendingCount(count || 0);
  }, [user]);

  useEffect(() => {
    fetchPendingCount();
  }, [fetchPendingCount]);

  // FIX: Subscribe to real-time changes so count updates immediately on insert/update/delete
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("sidebar-pending-count")
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT, UPDATE, DELETE
          schema: "public",
          table: "interactions",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Re-fetch count on any change
          fetchPendingCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchPendingCount]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-sidebar hidden md:flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">SocialRep</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4">
          <ul className="space-y-1">
            {sidebarLinks.slice(0, 2).map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    data-tour={link.tourId}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    )}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                    {link.label === "Smart Inbox" && pendingCount > 0 && (
                      <span className="ml-auto px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground text-xs">
                        {pendingCount > 99 ? "99+" : pendingCount}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
            
            {/* Expandable Streams Menu */}
            <li data-tour="streams">
              <StreamsSidebarMenu />
            </li>
            
            {sidebarLinks.slice(2).map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    data-tour={link.tourId}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    )}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent/50">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {(profile?.full_name || user?.email || "U")[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile?.full_name || user?.email}</p>
              <p className="text-xs text-muted-foreground truncate">{profile?.company_name || planLabel}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <Link to="/" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-primary-foreground" />
                </div>
              </Link>
            </div>
            <h1 className="text-lg font-semibold">
              {sidebarLinks.find((l) => l.href === location.pathname)?.label || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* FIX: Bell icon shows real pending count badge */}
            <Link to="/dashboard/inbox">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {pendingCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-medium">
                    {pendingCount > 9 ? "9+" : pendingCount}
                  </span>
                )}
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {(profile?.full_name || user?.email || "U")[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
      
      {/* Onboarding Tour */}
      <OnboardingTour />
    </div>
  );
}
