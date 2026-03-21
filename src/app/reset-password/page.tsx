import { Suspense } from "react";
import ResetPasswordClient from "./reset-password-client";

function ResetPasswordFallback() {
  return (
    <div className="unimath-shell flex min-h-screen items-center justify-center px-4">
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordClient />
    </Suspense>
  );
}
