import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardLayoutClient from "@/components/ui/DashboardLayoutClient";
import { db } from "@/lib/db";

export const revalidate = 0; // Disable layout caching to fetch fresh database states

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Fetch fresh points and details from database in real-time
  const user = await db.user.findUnique({
    where: { id: session.id },
    select: { points: true, nama: true, role: true, email: true },
  });

  const fullUserSession = user ? {
    ...session,
    name: user.nama,
    email: user.email,
    role: user.role,
    points: user.points,
  } : null;

  return (
    <DashboardLayoutClient user={fullUserSession as any}>
      {children}
    </DashboardLayoutClient>
  );
}
