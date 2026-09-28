import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import VouchersClient from "./VouchersClient";

export const revalidate = 0;

export default async function VouchersPage() {
  const session = await getSession();
  const userId = session?.id || "";

  const [user, vouchers, userPenukaran] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { points: true },
    }),
    db.voucher.findMany({
      orderBy: { biayaPoin: "asc" },
    }),
    db.penukaranVoucher.findMany({
      where: { userId },
      include: { voucher: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <VouchersClient
      userRole={session?.role || "USER"}
      userPoints={user?.points ?? 0}
      vouchers={vouchers as any}
      redeemedVouchers={userPenukaran.map((p) => ({
        id: p.id,
        title: p.voucher.judul,
        code: p.voucher.kodeVoucher,
        cost: p.voucher.biayaPoin,
        createdAt: p.createdAt,
      }))}
    />
  );
}
