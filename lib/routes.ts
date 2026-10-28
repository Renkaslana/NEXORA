// Pembentuk URL rute yang dipakai di beberapa tempat.

/** Halaman Komparasi untuk 2–3 laptop (PRD §18). */
export function compareHref(ids: string[]) {
  return `/bandingkan?ids=${ids.join(",")}`
}
