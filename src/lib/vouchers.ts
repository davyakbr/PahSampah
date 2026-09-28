// Shared voucher options — importable by both server and client components
export const VOUCHER_OPTIONS = [
  {
    id: "v1",
    title: "Voucher Alfamart",
    description: "Belanja di Alfamart terdekat",
    value: "Rp 10.000",
    cost: 100,
    codePrefix: "PAH-ALFA-",
    emoji: "🛒",
    color: "from-red-50 to-rose-100 border-red-200",
    badge: "bg-red-100 text-red-800",
  },
  {
    id: "v2",
    title: "Voucher Indomaret",
    description: "Belanja di Indomaret terdekat",
    value: "Rp 25.000",
    cost: 250,
    codePrefix: "PAH-INDO-",
    emoji: "🏪",
    color: "from-blue-50 to-sky-100 border-blue-200",
    badge: "bg-blue-100 text-blue-800",
  },
  {
    id: "v3",
    title: "Voucher Tokopedia",
    description: "Belanja online di Tokopedia",
    value: "Rp 50.000",
    cost: 500,
    codePrefix: "PAH-TOKO-",
    emoji: "🟢",
    color: "from-green-50 to-emerald-100 border-green-200",
    badge: "bg-green-100 text-green-800",
  },
  {
    id: "v4",
    title: "Voucher ShopeePay",
    description: "Saldo ShopeePay langsung masuk",
    value: "Rp 100.000",
    cost: 1000,
    codePrefix: "PAH-SHOP-",
    emoji: "🧡",
    color: "from-orange-50 to-amber-100 border-orange-200",
    badge: "bg-orange-100 text-orange-800",
  },
] as const;

export type VoucherOption = (typeof VOUCHER_OPTIONS)[number];
