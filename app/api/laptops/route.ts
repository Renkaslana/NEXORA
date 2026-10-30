import { NextRequest, NextResponse } from "next/server";
import { rawCatalogItems } from "@/lib/catalog-service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const brand = searchParams.get("brand")?.toLowerCase();
  const search = searchParams.get("search")?.toLowerCase();
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null;
  const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null;
  const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 50;

  let filtered = rawCatalogItems;

  if (brand) {
    filtered = filtered.filter((d) => (d.Brand || "").toLowerCase().includes(brand));
  }

  if (search) {
    filtered = filtered.filter(
      (d) =>
        (d.Model_Seri || "").toLowerCase().includes(search) ||
        (d.Brand || "").toLowerCase().includes(search) ||
        (d.Processor_CPU || "").toLowerCase().includes(search) ||
        (d.Kartu_Grafis_GPU || "").toLowerCase().includes(search)
    );
  }

  if (maxPrice) {
    filtered = filtered.filter((d) => (parseFloat(String(d.Estimasi_Harga_Pasar_IDR)) || 0) <= maxPrice);
  }

  if (minPrice) {
    filtered = filtered.filter((d) => (parseFloat(String(d.Estimasi_Harga_Pasar_IDR)) || 0) >= minPrice);
  }

  return NextResponse.json({
    success: true,
    status_code: 200,
    message: "Katalog laptop berhasil dimuat",
    data: filtered.slice(0, limit),
    meta: {
      total: filtered.length,
      limit,
      system_name: "Speco",
      timestamp: new Date().toISOString(),
    },
  });
}
