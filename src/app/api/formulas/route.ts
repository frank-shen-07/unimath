import { generateFormulaSheet } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();

    if (!topic) {
      return Response.json({ error: "Topic is required" }, { status: 400 });
    }

    const result = await generateFormulaSheet(topic);
    return Response.json(result);
  } catch (error) {
    console.error("Formula API error:", error);
    return Response.json(
      { error: "Failed to generate formula sheet" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { data } = await supabase
      .from("formula_sheets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    return Response.json({ sheets: data || [] });
  } catch (error) {
    console.error("Formula GET error:", error);
    return Response.json({ error: "Failed to fetch formula sheets" }, { status: 500 });
  }
}
