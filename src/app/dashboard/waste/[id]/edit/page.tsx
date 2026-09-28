import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Admin no longer edits waste — status is managed via the detail page.
// This page redirects to the detail page.
export default async function EditWastePage({ params }: PageProps) {
  const { id } = await params;
  const session = await getSession();

  if (!session) redirect("/login");

  redirect(`/dashboard/waste/${id}`);
}
