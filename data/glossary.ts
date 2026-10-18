import type { SpecComponent } from "@/types";

// Penjelasan awam istilah teknis (PRD §1, §28, §33: "Apa itu Wh?").
// Jangan diimpor dari komponen: akses lewat `lib/api.ts`.

export const glossary: Record<SpecComponent, { term: string; explanation: string }> = {
  cpu: {
    term: "CPU",
    explanation:
      "Otak laptop. Makin banyak core, makin lancar menjalankan banyak aplikasi berat sekaligus. Seri H lebih kencang dari seri U, seri U lebih hemat baterai.",
  },
  ram: {
    term: "RAM",
    explanation:
      "Meja kerja laptop: tempat aplikasi yang sedang terbuka. 8 GB cukup untuk dokumen, 16 GB untuk IDE, Docker, atau desain.",
  },
  storage: {
    term: "SSD",
    explanation: "Tempat menyimpan file dan aplikasi. SSD jauh lebih cepat dari hard disk; 512 GB cukup untuk kebanyakan mahasiswa.",
  },
  gpu: {
    term: "GPU",
    explanation:
      "Pengolah grafis. Integrated menyatu dengan CPU dan cukup untuk Office dan Figma; dedicated (mis. RTX 4050) perlu untuk 3D, render video, dan game.",
  },
  layar: {
    term: "IPS, OLED, sRGB",
    explanation:
      "IPS dan OLED menampilkan warna lebih akurat dari panel biasa. sRGB 100% berarti warna di layar sama dengan yang dilihat orang lain atau hasil cetak.",
  },
  baterai: {
    term: "Wh",
    explanation: "Watt-hour, kapasitas baterai. Kira-kira: 50 Wh ≈ 8 jam pemakaian ringan, 75 Wh ≈ 12 jam.",
  },
};
