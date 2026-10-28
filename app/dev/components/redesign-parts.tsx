"use client";

import Image from "next/image";
import { IconTile } from "@/components/ui/icon-tile";
import { LaptopRender } from "@/components/ui/laptop-render";
import { MoodPhoto } from "@/components/ui/mood-photo";
import { NeedMeter, NeedMeterGroup } from "@/components/ui/need-meter";
import { Skeleton } from "@/components/ui/skeleton";
import { getLaptops, getRecommendations, getRequirements, getSampleProfile } from "@/lib/api";
import { CRITERION_ICONS } from "@/lib/icons";
import { availableAngles, RENDER_MANIFEST, renderSrc } from "@/lib/laptop-image";
import { MOOD_PHOTOS, type MoodPhotoId } from "@/lib/mood-photos";
import { METRIC_SCALES, needMeterRows } from "@/lib/need-meter";
import { useApi } from "@/lib/use-api";
import type { CriterionId } from "@/types";

// Komponen fondasi redesign R1 (docs/archive/REDESIGN.md §10–13, §24, §28) untuk review di /dev/components.

function Label({ children }: { children: React.ReactNode }) {
  return <p className="type-micro tracking-wide text-text-muted uppercase">{children}</p>;
}

const ALL_IDS = Array.from({ length: 12 }, (_, i) => `lp-${String(i + 1).padStart(3, "0")}`);
const loadAll = () => getLaptops(ALL_IDS);
const loadMeterDemo = () =>
  Promise.all([getRecommendations(getSampleProfile("teknik")), getRequirements(getSampleProfile("teknik"))]);

export function IconTiles() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Label>Tile 40 · kategori performa, memori, layar, mobilitas, umum</Label>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {(Object.keys(CRITERION_ICONS) as CriterionId[]).map((id) => {
            const meta = CRITERION_ICONS[id];
            return (
              <li key={id} className="flex items-center gap-3 rounded-card border border-border p-3">
                <IconTile icon={meta.icon} category={meta.category} />
                <span className="type-small text-text">{meta.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="flex flex-col gap-3">
        <Label>Tile 32 (baris meter)</Label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(CRITERION_ICONS) as CriterionId[]).map((id) => (
            <IconTile key={id} icon={CRITERION_ICONS[id].icon} category={CRITERION_ICONS[id].category} size="sm" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function LaptopRenders() {
  const state = useApi(loadAll);
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <Label>Manifest · {RENDER_MANIFEST.length} file di public/images/laptops (latar studio #EEF0F4)</Label>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {RENDER_MANIFEST.map((name) => (
            <li key={name} className="flex flex-col gap-1.5">
              <div className="relative aspect-[4/3] overflow-hidden rounded-control bg-studio">
                <Image src={renderSrc(name)} alt="" fill sizes="240px" className="object-contain" />
              </div>
              <code className="num type-micro text-text-muted">{name}</code>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-3">
        <Label>12 laptop mock → render (hover kartu: render naik + membesar)</Label>
        {state.status !== "success" ? (
          <Skeleton className="h-72 rounded-card bg-surface" aria-label="Memuat laptop" />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {state.data.map((laptop) => (
              <li key={laptop.id} className="group/card flex flex-col overflow-hidden rounded-card border border-border">
                <LaptopRender
                  image={laptop.image}
                  sizes="(min-width: 1024px) 280px, 50vw"
                  imageClassName="transition-transform duration-[var(--motion-medium)] ease-out group-hover/card:-translate-y-1 group-hover/card:scale-[1.03]"
                />
                <div className="flex flex-col gap-0.5 p-3">
                  <span className="type-small text-text">
                    {laptop.brand} {laptop.model}
                  </span>
                  <span className="num type-micro text-text-muted">
                    {laptop.image.shape}-{laptop.image.color} · sudut: {availableAngles(laptop.image).join(", ")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function NeedMeters() {
  const state = useApi(loadMeterDemo);
  if (state.status !== "success") {
    return <Skeleton className="h-96 rounded-card bg-surface" aria-label="Memuat contoh meter" />;
  }
  const [set, req] = state.data;
  const best = set.items[0];
  const weak = set.items[set.items.length - 1];
  const ram = METRIC_SCALES.ramGb;
  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <NeedMeterGroup title="Mode requirement · Profil Kebutuhan">
        {needMeterRows(req).map((row, i) => (
          <NeedMeter key={row.component} component={row.component} scale={row.scale} need={row.need} index={i} />
        ))}
      </NeedMeterGroup>
      <NeedMeterGroup title={`Mode laptop · ${weak.laptop.brand} ${weak.laptop.model}`}>
        {needMeterRows(req, weak.laptop).map((row, i) => (
          <NeedMeter
            key={row.component}
            component={row.component}
            scale={row.scale}
            need={row.need}
            value={row.value}
            index={i}
          />
        ))}
      </NeedMeterGroup>
      <NeedMeterGroup title={`Mode laptop · ${best.laptop.brand} ${best.laptop.model}`}>
        {needMeterRows(req, best.laptop).map((row, i) => (
          <NeedMeter
            key={row.component}
            component={row.component}
            scale={row.scale}
            need={row.need}
            value={row.value}
            size="compact"
            index={i}
          />
        ))}
      </NeedMeterGroup>
      <NeedMeterGroup title="Mode compare · RAM A/B/C">
        <NeedMeter
          component="ram"
          scale={ram}
          need={16}
          markers={[
            { key: "A", name: "Laptop A", value: 16 },
            { key: "B", name: "Laptop B", value: 8 },
            { key: "C", name: "Laptop C", value: 32 },
          ]}
        />
        <NeedMeter
          component="baterai"
          scale={METRIC_SCALES.batteryWh}
          need={60}
          markers={[
            { key: "A", name: "Laptop A", value: 57 },
            { key: "B", name: "Laptop B", value: 75 },
          ]}
        />
      </NeedMeterGroup>
    </div>
  );
}

export function MoodPhotos() {
  const ids = Object.keys(MOOD_PHOTOS) as MoodPhotoId[];
  return (
    <div className="flex flex-col gap-6">
      <Label>Duotone seragam · reveal clip-path sekali saat masuk viewport (gerak 12)</Label>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ids.map((id) => {
          const { credit } = MOOD_PHOTOS[id];
          return (
            <li key={id} className="flex flex-col gap-2">
              <MoodPhoto id={id} sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" />
              <p className="type-micro font-medium tracking-normal text-text-muted">
                <code className="num">{id}</code> · {credit.title} oleh {credit.author}, {credit.license} via{" "}
                {credit.url ? (
                  <a href={credit.url} className="text-primary underline-offset-2 hover:underline">
                    {credit.source}
                  </a>
                ) : (
                  credit.source
                )}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
