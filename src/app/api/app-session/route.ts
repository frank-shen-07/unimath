import { getServerAuthSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getServerAuthSession();
    return Response.json({ session });
  } catch (error) {
    console.error("App session API error:", error);
    return Response.json(
      { error: "Failed to load app session" },
      { status: 500 }
    );
  }
}
