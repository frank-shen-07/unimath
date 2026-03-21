import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { findSupabaseAuthUserByEmail } from "@/lib/supabase/auth-user-lookup";

type EnsureAppUserLinkInput = {
  authUserId: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
};

function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() ?? "";
}

async function createShadowSupabaseUser(input: {
  email: string;
  name?: string | null;
  image?: string | null;
}) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email: input.email,
    email_confirm: true,
    user_metadata: {
      authjs_shadow_user: true,
      full_name: input.name ?? undefined,
      name: input.name ?? undefined,
      avatar_url: input.image ?? undefined,
      picture: input.image ?? undefined,
    },
  });

  if (error || !data.user) {
    throw error ?? new Error("Failed to provision Supabase app user.");
  }

  return data.user.id;
}

export async function getAppUserLink(authUserId: string) {
  return prisma.appUserLink.findUnique({
    where: { authUserId },
  });
}

export async function ensureAppUserLink(input: EnsureAppUserLinkInput) {
  const existingLink = await getAppUserLink(input.authUserId);

  if (existingLink) {
    return existingLink;
  }

  const normalizedEmail = normalizeEmail(input.email);

  if (!normalizedEmail) {
    throw new Error("Auth.js sign-in requires an email address.");
  }

  const appUserId =
    (await findSupabaseAuthUserByEmail(normalizedEmail))?.id ??
    (await createShadowSupabaseUser({
      email: normalizedEmail,
      name: input.name,
      image: input.image,
    }));

  return prisma.appUserLink.upsert({
    where: { authUserId: input.authUserId },
    update: {
      appUserId,
      email: normalizedEmail,
    },
    create: {
      authUserId: input.authUserId,
      appUserId,
      email: normalizedEmail,
    },
  });
}
