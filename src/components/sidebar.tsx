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
  Dumbbell,
  BookOpen,
  Layers,
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
  { href: "/practice", label: "Practice", icon: Dumbbell },
  { href: "/formulas", label: "Formulas", icon: BookOpen },
  { href: "/flashcards", label: "Flashcards", icon: Layers },
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
        "relative z-40 flex h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar/90 backdrop-blur-xl transition-all duration-300",
        collapsed ? "w-[92px]" : "w-[290px]"
      )}
    >
      <div className="editorial-grid absolute inset-0 opacity-[0.05]" />
      <div
        className={cn(
          "relative flex items-center px-5 pb-5 pt-6",
          collapsed ? "justify-center" : "gap-4"
        )}
      >
        <div className="unimath-panel-muted flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md">
          <span className="font-serif text-xl font-semibold text-foreground">U</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <span className="block font-serif text-3xl leading-none tracking-[-0.04em] text-foreground">
              UniMath
            </span>
            <p className="font-label mt-1 text-[10px] text-muted-foreground">Study workspace</p>
          </div>
        )}
        {!collapsed && <div className="ml-auto w-6" />}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "unimath-panel absolute top-6 z-[200] h-9 w-9 rounded-sm text-muted-foreground shadow-[0_8px_24px_rgba(0,0,0,0.18)] hover:text-foreground",
          collapsed ? "-right-4" : "-right-4"
        )}
        onClick={handleToggleSidebar}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
      </Button>

      <nav className="relative flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md text-sm font-medium transition-all duration-200",
                collapsed ? "justify-center px-0 py-3" : "gap-3 px-4 py-3",
                isActive
                  ? "bg-primary text-primary-foreground shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
                  : "text-sidebar-foreground/66 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
              aria-label={item.label}
            >
              <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
              {!collapsed && (
                <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                  <span>{item.label}</span>
                  {isActive ? (
                    <span className="font-label text-[10px] text-primary-foreground/55">
                      Open
                    </span>
                  ) : null}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="relative space-y-1 p-3">
        <Separator className="mb-2 opacity-15" />
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className={cn(
            "flex w-full items-center rounded-md text-sm font-medium text-sidebar-foreground/66 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-foreground",
            collapsed ? "justify-center px-0 py-3" : "gap-3 px-4 py-3"
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
            "flex items-center rounded-md text-sm font-medium transition-all duration-200",
            collapsed ? "justify-center px-0 py-3" : "gap-3 px-4 py-3",
            pathname === "/settings"
              ? "bg-primary text-primary-foreground shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
              : "text-sidebar-foreground/66 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          )}
          aria-label="Settings"
        >
          <Settings className="h-[18px] w-[18px] flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>

        <button
          onClick={handleSignOut}
          className={cn(
            "flex w-full items-center rounded-md text-sm font-medium text-sidebar-foreground/66 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-foreground",
            collapsed ? "justify-center px-0 py-3" : "gap-3 px-4 py-3"
          )}
          aria-label="Sign out"
        >
          <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
          {!collapsed && <span>{signingOut ? "Signing out..." : "Sign out"}</span>}
        </button>

        <Separator className="opacity-15" />

        <div
          className={cn(
            "unimath-panel-muted rounded-md px-3 py-3",
            collapsed ? "flex justify-center" : "flex items-center gap-3"
          )}
        >
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-accent text-xs font-semibold text-foreground">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
