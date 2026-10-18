import type { WizardStepId } from "@/store/profile"
import type { UserProfile } from "@/types"

// Lima langkah Wizard (PRD §15). Urutan: Jurusan sebelum Aktivitas agar jurusan bisa
// menyorot aktivitas & software yang relevan.

export interface WizardStep {
  id: WizardStepId
  label: string
  question: string
  helper: string
  skippable: boolean
}

export const wizardSteps: WizardStep[] = [
  {
    id: "budget",
    label: "Budget",
    question: "Berapa budget-mu?",
    helper: "Geser, ketik, atau pilih kisaran. Angka ini batas atas; aktifkan toleransi bila masih bisa sedikit lebih.",
    skippable: false,
  },
  {
    id: "jurusan",
    label: "Jurusan",
    question: "Kamu kuliah atau bekerja di bidang apa?",
    helper: "Bidangmu membantu kami menyorot aktivitas dan aplikasi yang biasanya kamu pakai.",
    skippable: false,
  },
  {
    id: "aktivitas",
    label: "Aktivitas",
    question: "Laptop ini akan dipakai untuk apa?",
    helper: "Pilih semua yang sesuai, lalu tandai satu yang paling utama.",
    skippable: false,
  },
  {
    id: "software",
    label: "Software",
    question: "Aplikasi apa yang sering kamu pakai?",
    helper: "Tag beban menunjukkan seberapa berat aplikasi itu untuk laptop. Langkah ini boleh dilewati.",
    skippable: true,
  },
  {
    id: "prioritas",
    label: "Prioritas",
    question: "Apa yang paling penting buatmu?",
    helper: "Pilih dan urutkan sampai tiga prioritas. Langkah ini boleh dilewati.",
    skippable: true,
  },
]

export const isWizardStep = (id: string | null | undefined): id is WizardStepId =>
  wizardSteps.some((s) => s.id === id)

export const stepHref = (id: WizardStepId) => `/rekomendasi/${id}`

/** Langkah wajib pertama yang belum valid (jurusan, aktivitas), untuk halaman setelah Wizard. */
export function firstMissingStep(profile: UserProfile): WizardStep | undefined {
  return wizardSteps.find((s) => (s.id === "jurusan" || s.id === "aktivitas") && validateStep(s.id, profile))
}

/** Pesan validasi untuk langkah ini, atau null bila valid (PRD §15, §28). */
export function validateStep(id: WizardStepId, profile: UserProfile): string | null {
  switch (id) {
    case "jurusan":
      return profile.major ? null : "Pilih satu bidang untuk melanjutkan."
    case "aktivitas":
      if (profile.activities.length === 0) return "Pilih minimal satu aktivitas."
      return profile.primaryActivity ? null : "Tandai satu aktivitas utama."
    case "prioritas":
      if (profile.priorityMode === "weights") {
        const total = profile.priorities.reduce((sum, p) => sum + (p.weight ?? 0), 0)
        return total === 100 ? null : `Total bobot harus 100% (sekarang ${total}%).`
      }
      return profile.priorities.length > 0 ? null : "Pilih minimal satu prioritas, atau tekan Lewati."
    default:
      return null
  }
}
