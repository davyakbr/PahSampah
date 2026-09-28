import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import WasteTypesClient from "./WasteTypesClient";

export const revalidate = 0;

export default async function WasteTypesAdminPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/dashboard");

  const wasteTypes = await db.jenisSampah.findMany({
    orderBy: { namaJenis: "asc" },
    include: {
      _count: { select: { laporanSampah: true } },
    },
  });

  return <WasteTypesClient wasteTypes={wasteTypes as any} />;
}
