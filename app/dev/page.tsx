import Link from "next/link";

// Indeks halaman eksplorasi & QA (bukan halaman final).
const pages = [
  { href: "/", title: "Landing final", note: "A + preview C · PRD §12–13" },
  { href: "/dev/components", title: "Komponen inti", note: "Tahap 1 · PRD §23" },
  { href: "/dev/landing-a", title: "Landing A — Hybrid", note: "Tahap 2 · PRD §12 Concept D, §13" },
  { href: "/dev/landing-b", title: "Landing B — Editorial", note: "Tahap 2 · PRD §12 Concept B" },
  { href: "/dev/landing-c", title: "Landing C — Konsultasi", note: "Tahap 2 · PRD §12 Concept C" },
];

export default function DevIndex() {
  return (
    <main className="page-container flex flex-col gap-8 py-16">
      <header className="flex flex-col gap-2">
        <p className="type-small text-text-muted">NEXORA · prototype frontend</p>
        <h1 className="type-h1 text-text">Halaman eksplorasi</h1>
        <p className="max-w-xl type-body text-text-muted">
          Halaman untuk review desain dan komponen. Varian landing di bawah disimpan sebagai arsip eksplorasi.
        </p>
      </header>
      <ul className="flex flex-col divide-y divide-border rounded-card border border-border">
        {pages.map((p) => (
          <li key={p.href}>
            <Link
              href={p.href}
              className="flex min-h-14 flex-col justify-center gap-0.5 px-5 py-4 hover:bg-surface sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="type-body font-semibold text-text">{p.title}</span>
              <span className="type-small font-normal text-text-muted">{p.note}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
