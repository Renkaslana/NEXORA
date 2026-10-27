/**
 * Token motion untuk Motion (Framer Motion), sama dengan CSS var di app/globals.css.
 * REDESIGN §13: motion menjelaskan perubahan; exit ≈ 60% enter; tidak pernah dari scale(0).
 */

export const EASE_OUT = [0.23, 1, 0.32, 1] as const;
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;

/** Detik, karena Motion memakai detik. */
export const DURATION = {
  fast: 0.14,
  medium: 0.24,
  slow: 0.56,
  count: 0.7,
} as const;

export const SPRING_SOFT = { type: "spring", duration: 0.5, bounce: 0.15 } as const;

/** Jeda antar item saat masuk berurutan; maksimal 6 item yang diberi jeda. */
export const STAGGER = 0.06;
export const STAGGER_MAX_ITEMS = 6;

export function staggerDelay(index: number): number {
  return Math.min(index, STAGGER_MAX_ITEMS - 1) * STAGGER;
}

/** Kurva lembut untuk perpindahan besar (slide hero, layout): lambat di awal dan akhir. */
export const EASE_SMOOTH = [0.65, 0, 0.35, 1] as const;

/**
 * Variant bersama (brief landing §38). Dipakai dengan `initial="hidden"` + `whileInView="show"` atau
 * `animate`. Reduced motion ditangani komponen (lewati `initial`).
 */
export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: DURATION.slow, ease: EASE_OUT } },
} as const;

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DURATION.slow, ease: EASE_OUT } },
} as const;

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: DURATION.slow, ease: EASE_OUT } },
} as const;

export const staggerContainer = (stagger = 0.08, delayChildren = 0) =>
  ({
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren } },
  }) as const;
