import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jirpzpqnrnzcsgiecogm.supabase.co";
// Kunci service_role hanya dibaca dari env. Jangan pernah menulisnya di kode.
const SERVICE_KEY = process.env.SPECO_SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_KEY) {
  console.error("SPECO_SUPABASE_SERVICE_ROLE_KEY belum di-set. Isi di .env.local lalu jalankan ulang.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

async function seed() {
  console.log("Memulai proses seeding 450 laptop ke Supabase:", SUPABASE_URL);

  const rawPath = path.join(__dirname, "../data/devices-catalog.json");
  if (!fs.existsSync(rawPath)) {
    console.error("File katalog data tidak ditemukan di", rawPath);
    process.exit(1);
  }

  const catalog = JSON.parse(fs.readFileSync(rawPath, "utf-8"));
  console.log(`Membaca ${catalog.length} data perangkat dari catalog.json...`);

  const records = catalog.map((d) => ({
    id: d.ID_Perangkat,
    brand: d.Brand,
    model: d.Model_Seri,
    series: d.Model_Seri,
    category: d.Kategori_Target,
    major_target: d.Target_Mahasiswa_Jurusan,
    cpu: d.Processor_CPU,
    gpu: d.Kartu_Grafis_GPU,
    is_dedicated_gpu: (d.Kartu_Grafis_GPU || "").toLowerCase().includes("rtx") || (d.Kartu_Grafis_GPU || "").toLowerCase().includes("gtx") || (d.Kartu_Grafis_GPU || "").toLowerCase().includes("rx"),
    ram_gb: parseFloat(d.RAM_GB) || 8.0,
    ram_upgradable: (d.Upgradeable_RAM || "").toLowerCase().includes("ya"),
    storage: d.Storage_GB_Tipe,
    display: d.Layar_Ukuran_Panel_ColorGamut,
    weight_kg: parseFloat(d.Bobot_kg) || 1.4,
    price_idr: Math.round(parseFloat(d.Estimasi_Harga_Pasar_IDR) || 0),
    image_url: d.Link_Gambar || null,
    buy_url: d.Platform_Rekomendasi_Beli || null,
    warranty: d.Status_Garansi_Resmi || null,
    usecase_tag: d.Rekomendasi_UseCase_Tag || null,
    device_type:
      (d.Model_Seri || "").toLowerCase().includes("mini") ||
      (d.Model_Seri || "").toLowerCase().includes("pc rakitan") ||
      (d.Model_Seri || "").toLowerCase().includes("desktop")
        ? "Mini PC"
        : "Laptop",
    pros: d.Pros_Kelebihan || null,
    cons: d.Cons_Kekurangan || null,
  }));

  // Batch insert per 50 records
  const BATCH_SIZE = 50;
  let successCount = 0;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("laptops").upsert(batch, { onConflict: "id" });
    if (error) {
      console.error(`Gagal batch ${i} - ${i + batch.length}:`, error.message);
    } else {
      successCount += batch.length;
      console.log(`Berhasil migrasi ${successCount} / ${records.length} unit laptop...`);
    }
  }

  console.log("Seeding selesai! Total unit tersimpan di Supabase:", successCount);
}

seed().catch((err) => {
  console.error("Terjadi kesalahan:", err);
  process.exit(1);
});
