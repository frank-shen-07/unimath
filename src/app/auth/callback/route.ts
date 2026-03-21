import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getSafeNextPath(next: string | null) {
  if (!next || !next.startsWith("/")) {
    return "/dashboard";
  }

  return next;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = getSafeNextPath(requestUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        new URL("/login?error=auth", requestUrl.origin)
      );
    }
  }

  return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
}
