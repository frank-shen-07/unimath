import { Suspense } from "react";
import LoginClient from "./login-client";

function LoginFallback() {
  return (
    <div className="unimath-shell flex min-h-screen items-center justify-center px-4">
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginClient />
    </Suspense>
  );
}
