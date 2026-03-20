import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="unimath-shell flex min-h-screen overflow-hidden">
      <AppSidebar user={user} />
      <main className="relative flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
