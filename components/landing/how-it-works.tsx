import { Reveal } from "@/components/landing/reveal"

// "Kamu cukup ceritakan kebutuhanmu." (brief redesign landing §13; PRD §6). Tiga langkah editorial:
// nomor besar, judul, dan satu kalimat, tanpa kartu. Judul dibuka lewat masker (text reveal).

const STEPS = [
  {
    title: "Ceritakan kebutuhanmu",
    body: "Budget, jurusan, aktivitas, aplikasi yang kamu pakai, dan prioritasmu. Cukup klik, tanpa istilah teknis.",
  },
  {
    title: "NEXORA menghitung kecocokan",
    body: "Setiap laptop dinilai pada kriteria yang relevan, dengan bobot dari prioritasmu.",
  },
  {
    title: "Dapatkan rekomendasi",
    body: "Laptop yang paling sesuai dengan profil kebutuhanmu, lengkap dengan alasan dan trade-off-nya.",
  },
]

export function HowItWorks() {
  return (
    <section id="cara-kerja" aria-labelledby="cara-kerja-title" className="scroll-mt-24 bg-white py-20 md:py-32">
      <div className="page-container grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <div className="flex flex-col gap-5 lg:sticky lg:top-32">
            <Reveal variant="clip">
              <h2 id="cara-kerja-title" className="text-[2.25rem] leading-[1.02] font-extrabold tracking-[-0.045em] text-ink-strong md:text-[3.5rem]">
                Kamu cukup ceritakan kebutuhanmu.
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="max-w-[28rem] type-body-l text-ink-soft">Sisanya NEXORA yang menyaring, menilai, dan menjelaskan.</p>
            </Reveal>
          </div>
        </div>

        <ol className="flex flex-col gap-14 md:gap-20 lg:col-span-6 lg:col-start-7">
          {STEPS.map((s, i) => (
            <li key={s.title} className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 md:gap-x-10">
              <Reveal variant="clip">
                <span
                  aria-hidden="true"
                  className="block text-[4.5rem] leading-[0.8] font-extrabold tracking-[-0.06em] text-data-blue tabular-nums md:text-[6.5rem]"
                >
                  {/* Nomor langkah besar (brief §13). */}
                  {String(i + 1).padStart(2, "0") /* taste-skill-ignore */}
                </span>
              </Reveal>
              <Reveal delay={0.1} innerClassName="flex flex-col gap-3 pt-1">
                <h3 className="text-2xl leading-8 font-extrabold tracking-[-0.03em] text-ink-strong md:text-[2rem] md:leading-10">
                  <span className="sr-only">Langkah {i + 1}: </span>
                  {s.title}
                </h3>
                <p className="max-w-[30rem] type-body-l text-ink-soft">{s.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
