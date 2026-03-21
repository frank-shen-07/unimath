import { findSupabaseAuthUserByIdentifier } from "@/lib/supabase/auth-user-lookup";

type ResolveIdentifierPayload = {
  identifier?: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ResolveIdentifierPayload;
    const identifier = payload.identifier?.trim() ?? "";

    if (!identifier) {
      return Response.json(
        { error: "Identifier is required" },
        { status: 400 }
      );
    }

    const user = await findSupabaseAuthUserByIdentifier(identifier);

    return Response.json({
      found: Boolean(user),
      email: user?.email ?? null,
      username:
        typeof user?.user_metadata?.username === "string"
          ? user.user_metadata.username
          : null,
    });
  } catch (error) {
    console.error("Resolve identifier API error:", error);
    return Response.json(
      { error: "Failed to resolve identifier" },
      { status: 500 }
    );
  }
}
