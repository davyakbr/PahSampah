import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { createWasteAction } from "@/app/actions/waste";
import WasteForm from "@/components/waste/WasteForm";
import { redirect } from "next/navigation";

export default async function NewWastePage() {
  const session = await getSession();
  if (!session || session.role !== "USER") redirect("/dashboard/waste");

  const [wilayahList, jenisSampahList] = await Promise.all([
    db.wilayah.findMany({ orderBy: { namaWilayah: "asc" } }),
    db.jenisSampah.findMany({ orderBy: { namaJenis: "asc" } }),
  ]);

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <WasteForm
        action={createWasteAction}
        wilayahList={wilayahList as any}
        jenisSampahList={jenisSampahList as any}
      />
    </div>
  );
}
