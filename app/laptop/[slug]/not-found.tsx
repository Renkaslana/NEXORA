import Link from "next/link";
import { WarningCircleIcon } from "@phosphor-icons/react/dist/ssr/WarningCircle";
import { FlowHeader } from "@/components/layout/flow-header";
import { Button } from "@/components/ui/button";
import { StateMessage } from "@/components/ui/state-message";

// PRD §26 Not found (Detail): judul, penjelasan, dan tindakan alternatif.
export default function LaptopNotFound() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <FlowHeader />
      <main className="page-container flex flex-1 flex-col pt-12 pb-20">
        <StateMessage icon={WarningCircleIcon} title="Laptop tidak ditemukan" body="Laptop tidak ditemukan atau sudah tidak tersedia.">
          <Button asChild>
            <Link href="/rekomendasi/hasil">Kembali ke hasil</Link>
          </Button>
          {/* "Jelajahi laptop" (/jelajah) ditambahkan saat halamannya dibuat (PRD §26). */}
        </StateMessage>
      </main>
    </div>
  );
}
