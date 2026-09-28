import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import LocationsClient from "./LocationsClient";

export const revalidate = 0;

export default async function LocationsAdminPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/dashboard");

  const locations = await db.wilayah.findMany({
    orderBy: { namaWilayah: "asc" },
    include: {
      _count: { select: { laporanSampah: true } },
    },
  });

  return <LocationsClient locations={locations as any} />;
}
