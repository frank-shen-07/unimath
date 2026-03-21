import { getServerAuthSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="unimath-shell flex min-h-screen overflow-hidden">
      <AppSidebar user={session.user} authSource={session.authSource} />
      <main className="relative flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
