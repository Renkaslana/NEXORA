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
