// Format angka untuk UI berbahasa Indonesia (PRD §1, §28).

const id = new Intl.NumberFormat("id-ID");
const idDecimal = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });

/** 8299000 → "Rp8.299.000" */
export function formatRupiah(value: number): string {
  return `Rp${id.format(Math.round(value))}`;
}

/** 8299000 → "Rp8,3 jt" · 8000000 → "Rp8 jt" · 500000 → "Rp500 rb" */
export function formatRupiahShort(value: number): string {
  if (value >= 1_000_000) return `Rp${idDecimal.format(value / 1_000_000)} jt`;
  if (value >= 1_000) return `Rp${id.format(Math.round(value / 1_000))} rb`;
  return formatRupiah(value);
}

/** Untuk `aria-valuetext` slider: 8500000 → "8,5 juta rupiah" (PRD §28). */
export function rupiahToWords(value: number): string {
  if (value >= 1_000_000) return `${idDecimal.format(value / 1_000_000)} juta rupiah`;
  if (value >= 1_000) return `${id.format(Math.round(value / 1_000))} ribu rupiah`;
  return `${id.format(value)} rupiah`;
}

/** 1.4 → "1,4 kg" */
export function formatWeight(kg: number): string {
  return `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(kg)} kg`;
}

/** 94.4 → "94,4" */
export function formatDecimal(value: number, digits = 1): string {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

/** 1024 → "1 TB" · 512 → "512 GB" */
export function formatStorage(gb: number): string {
  return gb >= 1024 ? `${idDecimal.format(gb / 1024)} TB` : `${gb} GB`;
}
