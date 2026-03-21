import type { User as SupabaseUser } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";

export type AppAuthSource = "authjs" | "supabase";

export type AppSession = {
  authSource: AppAuthSource;
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  };
};

function mapSupabaseUser(user: SupabaseUser): AppSession {
  const metadata = user.user_metadata ?? {};

  return {
    authSource: "supabase",
    user: {
      id: user.id,
      email: user.email,
      name:
        metadata.full_name ??
        metadata.name ??
        metadata.username ??
        user.email?.split("@")[0] ??
        null,
      image: metadata.avatar_url ?? metadata.picture ?? null,
    },
  };
}

function isMissingSupabaseRefreshToken(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "refresh_token_not_found"
  );
}

export async function getServerAuthSession() {
  const authJsSession = await getServerSession(authOptions);

  if (authJsSession?.user?.id) {
    return {
      authSource: "authjs",
      user: {
        id: authJsSession.user.id,
        email: authJsSession.user.email,
        name: authJsSession.user.name,
        image: authJsSession.user.image,
      },
    } satisfies AppSession;
  }

  const supabase = await createSupabaseServerClient();
  let user: SupabaseUser | null = null;

  try {
    const {
      data: { user: nextUser },
    } = await supabase.auth.getUser();
    user = nextUser;
  } catch (error) {
    if (isMissingSupabaseRefreshToken(error)) {
      return null;
    }

    throw error;
  }

  if (!user) {
    return null;
  }

  return mapSupabaseUser(user);
}

export async function requireServerAuthSession() {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return session;
}
