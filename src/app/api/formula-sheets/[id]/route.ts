import { requireServerAuthSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireServerAuthSession();
    const { id } = await context.params;
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("formula_sheets")
      .delete()
      .eq("id", id)
      .eq("user_id", session.user.id);

    if (error) {
      throw error;
    }

    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Formula sheets DELETE error:", error);
    return Response.json(
      { error: "Failed to delete formula sheet" },
      { status: 500 }
    );
  }
}
