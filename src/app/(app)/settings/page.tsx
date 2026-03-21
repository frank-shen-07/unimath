"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { EditorialPage, EditorialPanel } from "@/components/editorial";
import { Sun, Moon, Monitor, Key } from "lucide-react";
import { toast } from "sonner";
import { useAppSession } from "@/lib/auth/use-app-session";

type ApiKeyState = {
  gemini: string;
  openai: string;
  anthropic: string;
  grok: string;
  deepseek: string;
};

const EMPTY_API_KEYS: ApiKeyState = {
  gemini: "",
  openai: "",
  anthropic: "",
  grok: "",
  deepseek: "",
};

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKeyState>(() => {
    if (typeof window === "undefined") {
      return EMPTY_API_KEYS;
    }

    const saved = window.localStorage.getItem("unimath_api_keys");

    if (!saved) {
      return EMPTY_API_KEYS;
    }

    try {
      return { ...EMPTY_API_KEYS, ...JSON.parse(saved) };
    } catch {
      return EMPTY_API_KEYS;
    }
  });
  const { theme, setTheme } = useTheme();
  const { session } = useAppSession();

  const handleSaveKeys = () => {
    localStorage.setItem("unimath_api_keys", JSON.stringify(apiKeys));
    toast.success("API keys saved locally");
  };

  const displayName =
    session?.user?.name ||
    session?.user?.email?.split("@")[0] ||
    "User";

  return (
    <EditorialPage className="max-w-none">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <EditorialPanel>
          <p className="font-label text-xs text-muted-foreground">Appearance</p>
          <h2 className="mt-2 font-serif text-3xl leading-none tracking-[-0.04em] text-foreground">
            Choose your theme
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Switch your workspace theme at any time.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Signed in as {displayName}
            {session?.user?.email ? ` (${session.user.email})` : ""}.
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
                className={`flex flex-col items-center gap-2 rounded-md border p-4 transition-all ${
                  theme === t.value
                    ? "border-primary/25 bg-primary text-primary-foreground"
                    : "border-border bg-card/70 text-foreground hover:bg-accent/70"
                }`}
              >
                <t.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        </EditorialPanel>

        <EditorialPanel>
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-primary" />
            <p className="font-label text-xs text-muted-foreground">API override</p>
          </div>
          <div className="mt-4 max-w-2xl">
            <p className="text-sm leading-6 text-muted-foreground">
              Save provider keys locally for personal overrides and future model routing.
            </p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              ["gemini", "Gemini", "AIza..."],
              ["openai", "OpenAI", "sk-..."],
              ["anthropic", "Claude / Anthropic", "sk-ant-..."],
              ["grok", "Grok / xAI", "xai-..."],
              ["deepseek", "DeepSeek", "sk-..."],
            ].map(([key, label, placeholder]) => (
              <div key={key} className="space-y-2">
                <label className="text-sm font-medium text-foreground">{label}</label>
                <Input
                  value={apiKeys[key as keyof ApiKeyState]}
                  onChange={(event) =>
                    setApiKeys((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                  placeholder={placeholder}
                  type="password"
                  className="unimath-input h-12 rounded-md text-foreground placeholder:text-muted-foreground/60"
                />
              </div>
            ))}
          </div>
          <Button
            onClick={handleSaveKeys}
            variant="outline"
            className="unimath-pill mt-5 h-11 rounded-sm px-5 text-foreground hover:bg-accent/70"
          >
            Save keys
          </Button>
        </EditorialPanel>
      </div>
    </EditorialPage>
  );
}
