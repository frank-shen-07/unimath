import { Suspense } from "react";
import PracticeClient from "./practice-client";

function PracticeFallback() {
  return (
    <div className="unimath-shell flex min-h-[50vh] items-center justify-center px-4">
      <p className="text-sm text-muted-foreground">Loading practice…</p>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<PracticeFallback />}>
      <PracticeClient />
    </Suspense>
  );
}
