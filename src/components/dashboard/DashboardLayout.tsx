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
  Bell,
  Bot,
  PenLine,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StreamsSidebarMenu } from "@/components/sidebar/StreamsSidebarMenu";
import { OnboardingTour } from "@/components/onboarding";

const sidebarLinks = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview", tourId: "overview" },
  { href: "/dashboard/inbox", icon: MessageSquare, label: "Smart Inbox", tourId: "smart-inbox" },
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
  const { plan } = useSubscription();
  const [collapsed, setCollapsed] = useState(false);

  const [pendingCount, setPendingCount] = useState(0);
  const planLabel = plan ? `${plan.display_name} Plan` : "Free Plan";

  const fetchPendingCount = useCallback(async () => {
    if (!user) { setPendingCount(0); return; }
    const { data: platformData } = await supabase
      .from("connected_platforms")
      .select("platform")
      .eq("user_id", user.id);
    const platforms = (platformData || []).map((p) => p.platform);
    if (platforms.length === 0) { setPendingCount(0); return; }
    const { count } = await supabase
      .from("interactions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "pending")
      .in("platform", platforms);
    setPendingCount(count || 0);
  }, [user]);

  useEffect(() => { fetchPendingCount(); }, [fetchPendingCount]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("sidebar-pending-count")
      .on("postgres_changes", { event: "*", schema: "public", table: "interactions", filter: `user_id=eq.${user.id}` }, () => fetchPendingCount())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchPendingCount]);

  const handleSignOut = async () => { await signOut(); navigate("/"); };

  const currentPageLabel = sidebarLinks.find((l) => l.href === location.pathname)?.label || "Dashboard";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={cn(
        "border-r border-border/50 bg-card/50 backdrop-blur-xl hidden md:flex flex-col transition-all duration-300 ease-out relative",
        collapsed ? "w-[72px]" : "w-64"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-border/50">
          <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
              <MessageSquare className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            {!collapsed && <span className="font-bold text-lg tracking-tight">SocialRep</span>}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <div className="space-y-0.5">
            {sidebarLinks.slice(0, 2).map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  data-tour={link.tourId}
                  title={collapsed ? link.label : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-primary" />
                  )}
                  <link.icon className={cn("h-[18px] w-[18px] flex-shrink-0", isActive && "text-primary")} />
                  {!collapsed && <span>{link.label}</span>}
                  {link.label === "Smart Inbox" && pendingCount > 0 && !collapsed && (
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold">
                      {pendingCount > 99 ? "99+" : pendingCount}
                    </span>
                  )}
                  {link.label === "Smart Inbox" && pendingCount > 0 && collapsed && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[9px] flex items-center justify-center font-semibold">
                      {pendingCount > 9 ? "9+" : pendingCount}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Streams */}
            <div data-tour="streams">
              <StreamsSidebarMenu />
            </div>

            {/* Divider */}
            <div className="!my-3 h-px bg-border/50 mx-2" />

            {sidebarLinks.slice(2).map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  data-tour={link.tourId}
                  title={collapsed ? link.label : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-primary" />
                  )}
                  <link.icon className={cn("h-[18px] w-[18px] flex-shrink-0", isActive && "text-primary")} />
                  {!collapsed && <span>{link.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow-sm z-10"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>

        {/* User */}
        <div className="p-3 border-t border-border/50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors",
                collapsed && "justify-center"
              )}>
                <Avatar className="h-8 w-8 ring-2 ring-border/50">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                    {(profile?.full_name || user?.email || "U")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium truncate">{profile?.full_name || user?.email}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{profile?.company_name || planLabel}</p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-52">
              <DropdownMenuItem asChild>
                <Link to="/dashboard/settings"><Settings className="h-4 w-4 mr-2" />Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 border-b border-border/50 bg-card/30 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <Link to="/" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-gradient-primary flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-primary-foreground" />
                </div>
              </Link>
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">{currentPageLabel}</h1>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-foreground">
              <Search className="h-[18px] w-[18px]" />
            </Button>
            <Link to="/dashboard/inbox">
              <Button variant="ghost" size="icon" className="relative rounded-xl text-muted-foreground hover:text-foreground">
                <Bell className="h-[18px] w-[18px]" />
                {pendingCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[9px] flex items-center justify-center font-semibold animate-pulse">
                    {pendingCount > 9 ? "9+" : pendingCount}
                  </span>
                )}
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl text-muted-foreground hover:text-foreground">
              {theme === "light" ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                      {(profile?.full_name || user?.email || "U")[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/settings"><Settings className="h-4 w-4 mr-2" />Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>

      <OnboardingTour />
    </div>
  );
}
