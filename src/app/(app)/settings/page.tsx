"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { EditorialHeader, EditorialPage, EditorialPanel, EditorialStat } from "@/components/editorial";
import { Settings, Sun, Moon, Monitor, LogOut, User, Key } from "lucide-react";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function SettingsPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [geminiKey, setGeminiKey] = useState("");
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      const saved = localStorage.getItem("unimath_gemini_key");
      if (saved) setGeminiKey(saved);
    };
    load();
  }, [supabase]);

  const handleSaveKey = () => {
    if (geminiKey.trim()) {
      localStorage.setItem("unimath_gemini_key", geminiKey.trim());
      toast.success("API key saved");
    } else {
      localStorage.removeItem("unimath_gemini_key");
      toast.success("API key removed");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "User";
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <EditorialPage className="max-w-none">
      <EditorialHeader
        eyebrow="Preferences"
        title="Settings"
        description="Manage your profile, theme, and optional API overrides."
        aside={
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/70">
            <Settings className="h-4 w-4 text-primary" />
            Personal workspace controls
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr,1fr]">
        <EditorialPanel>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <p className="text-xs uppercase tracking-[0.24em] text-white/38">Account</p>
          </div>
          <div className="mt-5 flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-white/10 text-lg font-semibold text-white">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-semibold text-white">{displayName}</p>
            <p className="text-white/48">{user?.email}</p>
          </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <EditorialStat label="Theme" value={theme || "dark"} detail="Switch at any time" />
            <EditorialStat label="Provider" value={user?.app_metadata?.provider || "email"} detail="Current sign-in method" />
          </div>
        </EditorialPanel>

        <EditorialPanel>
          <p className="text-xs uppercase tracking-[0.24em] text-white/38">Appearance</p>
          <h2 className="mt-2 font-serif text-3xl leading-none tracking-[-0.04em] text-white">
            Choose your theme
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/52">
            Light, dark, or system. Dark is the new default across the redesigned app.
          </p>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { value: "light", icon: Sun, label: "Light" },
              { value: "dark", icon: Moon, label: "Dark" },
              { value: "system", icon: Monitor, label: "System" },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={`flex flex-col items-center gap-2 rounded-[1.5rem] border p-4 transition-all ${
                  theme === t.value
                    ? "border-white/20 bg-white text-black"
                    : "border-white/10 bg-black/20 text-white hover:bg-white/[0.06]"
                }`}
              >
                <t.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        </EditorialPanel>

        <EditorialPanel className="xl:col-span-2">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-primary" />
            <p className="text-xs uppercase tracking-[0.24em] text-white/38">API override</p>
          </div>
          <div className="mt-4 max-w-2xl">
            <p className="text-sm leading-6 text-white/52">
              Optionally provide your own Gemini API key. If left empty, the server-side default is used.
            </p>
          </div>
          <div className="mt-5 space-y-3">
          <Input
            value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
            placeholder="AIza..."
            type="password"
            className="h-12 rounded-[1.25rem] border-white/10 bg-black/20 text-white placeholder:text-white/30"
          />
          <Button onClick={handleSaveKey} variant="outline" className="h-11 rounded-full border-white/10 bg-white/[0.04] px-5 text-white hover:bg-white/[0.08]">
            Save Key
          </Button>
          </div>

          <Separator className="my-6 opacity-15" />

          <Button onClick={handleSignOut} variant="outline" className="h-11 rounded-full border-red-400/20 bg-red-400/10 px-5 text-red-100 hover:bg-red-400/15 hover:text-red-50">
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </EditorialPanel>
      </div>
    </EditorialPage>
  );
}
