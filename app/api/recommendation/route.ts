import { NextRequest, NextResponse } from "next/server";
import { calculateSawRecommendations, RecommendationQuery } from "@/lib/spk-saw";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const query: RecommendationQuery = {
      budgetMax: body.budget ? Number(body.budget) : (body.budgetMax ? Number(body.budgetMax) : undefined),
      budgetMin: body.budgetMin ? Number(body.budgetMin) : undefined,
      persona: body.persona || (body.major ? mapMajorToPersona(body.major) : "informatika"),
      needs: body.needs || body.activities || [],
      limit: body.limit ? Number(body.limit) : 10,
    };

    const results = calculateSawRecommendations(query);

    return NextResponse.json({
      success: true,
      status_code: 200,
      message: "Kalkulasi rekomendasi SPK SAW berhasil diproses secara native di server Next.js",
      data: {
        total: results.length,
        persona: query.persona,
        recommendations: results,
      },
      meta: {
        system_name: "Speco",
        engine: "Next.js Native SAW Engine",
        dataset_records: 450,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        status_code: 500,
        message: "Gagal memproses rekomendasi SPK SAW: " + ((error instanceof Error ? error.message : "") || "Unknown error"),
        meta: {
          system_name: "Speco",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}

function mapMajorToPersona(major: string): string {
  const m = (major || "").toLowerCase();
  if (m.includes("informatika") || m.includes("komputer") || m.includes("sistem informasi") || m.includes("coding")) {
    return "informatika";
  }
  if (m.includes("dkv") || m.includes("desain") || m.includes("arsitektur") || m.includes("animasi")) {
    return "desain";
  }
  if (m.includes("mesin") || m.includes("sipil") || m.includes("elektro") || m.includes("game")) {
    return "gaming_teknik";
  }
  if (m.includes("akuntansi") || m.includes("manajemen") || m.includes("bisnis") || m.includes("ekonomi")) {
    return "bisnis_data";
  }
  if (m.includes("kedokteran") || m.includes("farmasi") || m.includes("perawat") || m.includes("kesehatan")) {
    return "medis";
  }
  return "umum";
}
