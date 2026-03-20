"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import type { User } from "@supabase/supabase-js";
import {
  LayoutDashboard,
  MessageSquare,
  Camera,
  Dumbbell,
  BookOpen,
  History,
  Map,
  Settings,
  LogOut,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "Chat Tutor", icon: MessageSquare },
  { href: "/solve", label: "Photo Solve", icon: Camera },
  { href: "/practice", label: "Practice", icon: Dumbbell },
  { href: "/formulas", label: "Formulas", icon: BookOpen },
  { href: "/history", label: "History", icon: History },
  { href: "/map", label: "Knowledge Map", icon: Map },
];

export function AppSidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const storedValue = window.localStorage.getItem("unimath_sidebar_collapsed");
    if (storedValue === "true") {
      setCollapsed(true);
    }
    setReady(true);
  }, []);

  const handleSignOut = async () => {
    if (signingOut) return;

    setSigningOut(true);

    try {
      await supabase.auth.signOut();
    } finally {
      router.replace("/login");
      router.refresh();
      window.location.href = "/login";
    }
  };

  const handleToggleSidebar = () => {
    setCollapsed((prev) => {
      const nextValue = !prev;
      window.localStorage.setItem(
        "unimath_sidebar_collapsed",
        String(nextValue)
      );
      return nextValue;
    });
  };

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "User";

  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border/50 bg-sidebar transition-all duration-300 h-full",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      <div className="flex items-center gap-3 p-4 h-16">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-sm font-bold text-primary-foreground">U</span>
        </div>
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight">UniMath</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("ml-auto h-8 w-8 flex-shrink-0", collapsed && "ml-0")}
          onClick={handleToggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>

      <Separator className="opacity-50" />

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 space-y-1">
        <Separator className="opacity-50 mb-2" />
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full transition-all duration-200",
            "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
          aria-label="Toggle theme"
        >
          <Sun className="h-[18px] w-[18px] flex-shrink-0 dark:hidden" />
          <Moon className="h-[18px] w-[18px] flex-shrink-0 hidden dark:block" />
          {!collapsed && (
            <span suppressHydrationWarning>
              {ready && resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
            </span>
          )}
        </button>

        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            pathname === "/settings"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          <Settings className="h-[18px] w-[18px] flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>

        <button
          onClick={handleSignOut}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full transition-all duration-200",
            "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
          aria-label="Sign out"
        >
          <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
          {!collapsed && <span>{signingOut ? "Signing out..." : "Sign out"}</span>}
        </button>

        <Separator className="opacity-50" />

        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
