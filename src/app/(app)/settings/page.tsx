"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Settings, Sun, Moon, Monitor, LogOut, User, Key } from "lucide-react";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function SettingsPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [geminiKey, setGeminiKey] = useState("");
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      const saved = localStorage.getItem("unimath_gemini_key");
      if (saved) setGeminiKey(saved);
    };
    load();
  }, []);

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
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="w-7 h-7 text-primary" /> Settings
        </h1>
        <p className="text-muted-foreground text-lg">Manage your account and preferences.</p>
      </motion.div>

      {/* Account */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="w-5 h-5" /> Account
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-lg">{displayName}</p>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Appearance</CardTitle>
          <CardDescription>Choose your preferred theme.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "light", icon: Sun, label: "Light" },
              { value: "dark", icon: Moon, label: "Dark" },
              { value: "system", icon: Monitor, label: "System" },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  theme === t.value
                    ? "border-primary bg-primary/5"
                    : "border-border/50 hover:border-primary/30"
                }`}
              >
                <t.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Key */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Key className="w-5 h-5" /> API Key Override
          </CardTitle>
          <CardDescription>
            Optionally provide your own Gemini API key. If empty, the server default is used.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
            placeholder="AIza..."
            type="password"
            className="rounded-xl border-border/50"
          />
          <Button onClick={handleSaveKey} variant="outline" className="rounded-xl">
            Save Key
          </Button>
        </CardContent>
      </Card>

      <Separator className="opacity-50" />

      {/* Sign Out */}
      <Button onClick={handleSignOut} variant="outline" className="w-full rounded-xl text-destructive hover:text-destructive hover:bg-destructive/5 border-destructive/20">
        <LogOut className="w-4 h-4 mr-2" /> Sign Out
      </Button>
    </div>
  );
}
