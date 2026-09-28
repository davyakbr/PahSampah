import { PrismaClient, Role, WasteCategory, WasteStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import * as bcrypt from "bcryptjs";
import "dotenv/config";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database with 3 default waste types...");

  await prisma.logAktivitas.deleteMany({});
  await prisma.logPoin.deleteMany({});
  await prisma.penukaranVoucher.deleteMany({});
  await prisma.voucher.deleteMany({});
  await prisma.fotoSampah.deleteMany({});
  await prisma.laporanSampah.deleteMany({});
  await prisma.wilayah.deleteMany({});
  await prisma.jenisSampah.deleteMany({});
  await prisma.user.deleteMany({});

  const hashedPassword = await bcrypt.hash("pahsampah123", 10);

  // 1. Users
  const admin = await prisma.user.create({
    data: { nama: "Admin PahSampah", email: "admin@pahsampah.com", noHp: "081234567890", password: hashedPassword, role: Role.ADMIN, points: 0 },
  });
  const budi = await prisma.user.create({
    data: { nama: "Budi Santoso", email: "budi@pahsampah.com", noHp: "081298765432", password: hashedPassword, role: Role.USER, points: 150 },
  });
  const ani = await prisma.user.create({
    data: { nama: "Ani Rahayu", email: "ani@pahsampah.com", noHp: "081311223344", password: hashedPassword, role: Role.USER, points: 50 },
  });
  console.log("✅ 1. Users created");

  // 2. JenisSampah (Default 3 items: Organik, Non Organik, B3)
  const jenisSampahData = [
    { namaJenis: "Organik",     category: WasteCategory.ORGANIK },
    { namaJenis: "Non Organik", category: WasteCategory.ANORGANIK },
    { namaJenis: "B3",          category: WasteCategory.B3 },
  ];
  const jenisSampahList = await Promise.all(
    jenisSampahData.map((d) => prisma.jenisSampah.create({ data: d }))
  );
  console.log(`✅ 2. ${jenisSampahList.length} default JenisSampah created (Organik, Non Organik, B3)`);

  // 3. Wilayah (Seluruh Kota & Kabupaten di Pulau Jawa)
  const wilayahNames = [
    // DKI Jakarta
    "Jakarta Barat", "Jakarta Pusat", "Jakarta Selatan", "Jakarta Timur", "Jakarta Utara", "Kepulauan Seribu",
    // Banten
    "Cilegon", "Lebak", "Pandeglang", "Serang", "Tangerang", "Tangerang Selatan",
    // Jawa Barat
    "Bandung", "Bandung Barat", "Banjar", "Bekasi", "Bogor", "Ciamis", "Cianjur", "Cimahi", "Cirebon",
    "Depok", "Garut", "Indramayu", "Karawang", "Kuningan", "Majalengka", "Pangandaran", "Purwakarta",
    "Subang", "Sukabumi", "Sumedang", "Tasikmalaya",
    // Jawa Tengah
    "Banjarnegara", "Banyumas (Purwokerto)", "Batang", "Blora", "Boyolali", "Brebes", "Cilacap", "Demak",
    "Grobogan (Purwodadi)", "Jepara", "Karanganyar", "Kebumen", "Kendal", "Klaten", "Kudus", "Magelang",
    "Pati", "Pekalongan", "Pemalang", "Purbalingga", "Purworejo", "Rembang", "Salatiga", "Semarang",
    "Sragen", "Sukoharjo", "Surakarta (Solo)", "Tegal", "Temanggung", "Wonogiri", "Wonosobo",
    // D.I. Yogyakarta
    "Bantul", "Gunungkidul", "Kulon Progo", "Sleman", "Yogyakarta",
    // Jawa Timur
    "Bangkalan", "Banyuwangi", "Batu", "Blitar", "Bojonegoro", "Bondowoso", "Gresik", "Jember", "Jombang",
    "Kediri", "Lamongan", "Lumajang", "Madiun", "Magetan", "Malang", "Mojokerto", "Nganjuk", "Ngawi",
    "Pacitan", "Pamekasan", "Pasuruan", "Ponorogo", "Probolinggo", "Sampang", "Sidoarjo", "Situbondo",
    "Sumenep", "Surabaya", "Trenggalek", "Tuban", "Tulungagung"
  ];
  const wilayahList = await Promise.all(
    wilayahNames.map((namaWilayah) => prisma.wilayah.create({ data: { namaWilayah } }))
  );
  console.log(`✅ 3. ${wilayahList.length} Wilayah se-Pulau Jawa created`);

  // 4. LaporanSampah
  const jakPusat = wilayahList.find((w) => w.namaWilayah === "Jakarta Pusat")!;
  const jakSel   = wilayahList.find((w) => w.namaWilayah === "Jakarta Selatan")!;
  const jakBar   = wilayahList.find((w) => w.namaWilayah === "Jakarta Barat")!;

  const organikType = jenisSampahList.find((j) => j.category === WasteCategory.ORGANIK)!;
  const anorganikType = jenisSampahList.find((j) => j.category === WasteCategory.ANORGANIK)!;
  const b3Type = jenisSampahList.find((j) => j.category === WasteCategory.B3)!;

  const lap1 = await prisma.laporanSampah.create({
    data: {
      deskripsi: "Botol Aqua 1.5L dan botol soda bekas 10 buah",
      berat: 1.2,
      status: WasteStatus.SELESAI,
      userId: budi.id,
      jenisSampahId: anorganikType.id,
      wilayahId: jakPusat.id,
    },
  });

  const lap2 = await prisma.laporanSampah.create({
    data: {
      deskripsi: "Sisa sayuran dan buah dapur kemarin",
      berat: 0.8,
      status: WasteStatus.PENDING,
      userId: budi.id,
      jenisSampahId: organikType.id,
      wilayahId: jakSel.id,
    },
  });

  const lap3 = await prisma.laporanSampah.create({
    data: {
      deskripsi: "Baterai bekas remote dan laptop mati",
      berat: 0.1,
      status: WasteStatus.PENDING,
      userId: ani.id,
      jenisSampahId: b3Type.id,
      wilayahId: jakBar.id,
    },
  });
  console.log("✅ 4. LaporanSampah created");

  // 5. FotoSampah
  await prisma.fotoSampah.create({
    data: {
      urlFoto: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500",
      laporanId: lap1.id,
    },
  });
  await prisma.fotoSampah.create({
    data: {
      urlFoto: "https://images.unsplash.com/photo-1604186837056-8e7c286756f2?w=500",
      laporanId: lap2.id,
    },
  });
  console.log("✅ 5. FotoSampah created");

  // 6. Voucher
  const voucher1 = await prisma.voucher.create({
    data: {
      judul: "Voucher Alfamart Rp 10.000",
      deskripsi: "Dapat digunakan untuk belanja di seluruh outlet Alfamart",
      kodeVoucher: "PAH-ALFA-10K",
      biayaPoin: 100,
      stok: 50,
    },
  });
  console.log("✅ 6. Voucher created");

  // 7. PenukaranVoucher
  await prisma.penukaranVoucher.create({
    data: {
      userId: budi.id,
      voucherId: voucher1.id,
    },
  });
  console.log("✅ 7. PenukaranVoucher created");

  // 8. LogPoin
  await prisma.logPoin.create({
    data: {
      userId: budi.id,
      jumlahPoin: 12,
      tipe: "MASUK",
      keterangan: "Poin dari laporan sampah botol bekas (1.2 kg)",
    },
  });
  console.log("✅ 8. LogPoin created");

  // 9. LogAktivitas
  await prisma.logAktivitas.create({
    data: {
      userId: budi.id,
      aktivitas: "Membuat laporan sampah baru di wilayah Jakarta Pusat",
    },
  });
  console.log("✅ 10. LogAktivitas created");

  console.log("\n🎉 Seeding complete with default 3 waste types!");
  console.log("   admin@pahsampah.com / pahsampah123 (Admin)");
  console.log("   budi@pahsampah.com  / pahsampah123 (User)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
