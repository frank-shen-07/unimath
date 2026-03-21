import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

function normalizeValue(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

async function listAllSupabaseAuthUsers() {
  const supabase = createAdminClient();
  const users: User[] = [];
  let page = 1;
  const perPage = 200;

  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw error;
    }

    users.push(...data.users);

    if (data.users.length < perPage) {
      return users;
    }

    page += 1;
  }
}

export async function findSupabaseAuthUserByEmail(email: string) {
  const normalizedEmail = normalizeValue(email);

  if (!normalizedEmail) {
    return null;
  }

  const users = await listAllSupabaseAuthUsers();
  return (
    users.find(
      (user) => normalizeValue(user.email) === normalizedEmail
    ) ?? null
  );
}

export async function findSupabaseAuthUserByIdentifier(identifier: string) {
  const normalizedIdentifier = normalizeValue(identifier);

  if (!normalizedIdentifier) {
    return null;
  }

  const users = await listAllSupabaseAuthUsers();

  return (
    users.find((user) => {
      const normalizedEmail = normalizeValue(user.email);
      const normalizedUsername = normalizeValue(
        typeof user.user_metadata?.username === "string"
          ? user.user_metadata.username
          : null
      );

      return (
        normalizedEmail === normalizedIdentifier ||
        normalizedUsername === normalizedIdentifier
      );
    }) ?? null
  );
}
