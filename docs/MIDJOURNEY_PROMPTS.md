# Paket Prompt Render AI — Render Laptop NEXORA

Untuk Fahren. Render ini menggantikan placeholder abu-abu di hero, kartu laptop, Detail, dan
Komparasi (lihat `docs/REDESIGN.md` §24). Prompt di bawah ditulis untuk Midjourney; set pertama
dibuat dengan **Gemini** dan hasilnya sudah lolos. File mentah ditaruh di `img/` (tidak di-commit),
hasil olahan di `public/images/laptops/`.

## 0. Status (19 Okt 2026)

| Bentuk-warna | `34` | `front` | `side` | `ports` |
| --- | --- | --- | --- | --- |
| ultrabook-silver | ✅ | — | ✅ | ✅ |
| ultrabook-mist | ✅ | — | — | — |
| mainstream-silver | ✅ | ✅ | ✅ | ✅ |
| mainstream-graphite | ✅ | — | — | — |
| mainstream-navy | ✅ | — | ✅ (dicerminkan) | ✅ |
| creator-navy | ✅ | — | — | — |
| creator-graphite | ✅ | — | — | — |

Prioritas berikutnya: `front` untuk 6 kombinasi lain, lalu `side`/`ports` graphite dan creator.
Catatan regenerate: dua render creator punya backlight RGB pink/teal; versi berikutnya sebaiknya
memakai "white keyboard backlight" agar tidak terasa glow.

> Penting: render ini **ilustrasi bentuk laptop**, bukan foto model asli (ASUS/Lenovo/dll.).
> Di UI diberi label kecil "Ilustrasi", dan prompt sengaja meminta laptop **tanpa logo merek**.

---

## 1. Yang perlu dihasilkan

Katalog mock punya 12 laptop. Agar seragam dan tidak terlalu banyak, kita pakai **3 bentuk ×
2–3 warna bodi**. Setiap laptop di mock dipetakan ke satu kombinasi.

| Bentuk | Ciri | Warna bodi | Laptop di mock |
| --- | --- | --- | --- |
| **ultrabook** | 14", sangat tipis, bezel tipis, bodi aluminium | `silver`, `mist` (abu kebiruan) | lp-002 IdeaPad Slim 5 (silver), lp-004 Vivobook S 14 OLED (mist), lp-005 Swift Go 14 (silver), lp-009 INBook X2 Slim (silver) |
| **mainstream** | 14", tebal sedang, keyboard tanpa numpad | `silver`, `graphite` (abu tua), `navy` (biru tua) | lp-001 Vivobook 14 (navy), lp-003 Aspire Lite (silver), lp-006 HP 14s (silver), lp-007 IdeaPad Slim 3 (graphite), lp-008 Vivobook Go (graphite), lp-010 Axioo Hype 5 (graphite) |
| **creator** | 15,6", lebih tebal, ventilasi belakang, keyboard dengan numpad (mewakili creator & gaming) | `navy`, `graphite` | lp-011 Vivobook Pro 15 OLED (navy), lp-012 LOQ 15 (graphite) |

Setiap kombinasi bentuk–warna butuh **4 sudut**:

| Sudut | Kode | Dipakai di |
| --- | --- | --- |
| Tiga perempat kiri, lid terbuka | `34` | Hero, kartu laptop, Komparasi |
| Depan lurus | `front` | Hero (layar diisi UI NEXORA), galeri Detail |
| Samping (profil tipis) | `side` | Galeri Detail, section "Ringan dibawa" |
| Close-up port sisi kiri | `ports` | Galeri Detail |

Total minimum: (2 + 3 + 2) kombinasi × 4 sudut = **28 gambar**. Kalau waktu terbatas, prioritas:
semua `34` dulu (7 gambar), lalu `front` (7), lalu sisanya.

## 2. Art direction (wajib sama untuk semua)

- **Kamera:** sudut 3/4 dari kiri ±35°, sedikit di atas mata (±15°), lensa 85mm (tanpa distorsi).
- **Lid:** terbuka ±110°.
- **Cahaya:** studio lembut, key light dari kiri atas, rim light tipis di tepi kanan, bayangan kontak
  lembut di bawah laptop.
- **Latar:** seamless abu sangat terang polos (#F4F5F7), tanpa vignette, supaya mudah diratakan.
- **Layar:** **mati, kaca hitam pekat datar dengan pantulan sangat halus** (untuk `front`, layar
  hitam polos agar UI NEXORA bisa ditempel tepat di area layar).
- **Material:** aluminium matte (ultrabook), plastik/metal matte halus (mainstream), metal gelap
  dengan ventilasi (creator).
- **Tanpa:** logo merek, teks, stiker, orang, tangan, kabel, properti meja, watermark.

## 3. Parameter

Midjourney V8.1 adalah default sejak Juni 2026, tetapi **Omni Reference (`--oref`) hanya ada di V7**.
Strateginya:

1. **Gambar jangkar (anchor)** untuk tiap bentuk dibuat di versi default (V8.1) dengan `--raw`
   supaya hasil fotorealistis dan literal.
2. **Sudut lain dan warna lain** dibuat di **V7** dengan `--oref <url anchor>` agar bentuk laptopnya
   sama persis, ditambah `--sref <url anchor>` agar cahaya dan nada warna seragam.
3. Pakai **`--seed` yang sama** dalam satu bentuk.

Parameter dasar: `--ar 4:3 --raw --stylize 50 --no logo, text, watermark, people, hands, cable, sticker`

> Cek ulang sintaks di [dokumentasi resmi Midjourney](https://docs.midjourney.com/) sebelum mulai;
> nama parameter kadang berubah antar versi.

## 4. Prompt

### 4.1 Jangkar per bentuk (sudut `34`, warna pertama)

**ultrabook · silver · 34**

```text
studio product photograph of an unbranded ultra-thin 14 inch aluminium laptop, silver anodized finish, lid open at 110 degrees, three-quarter view from the front left at slightly elevated angle, thin bezels, screen off showing flat black glass with a faint soft reflection, soft diffused key light from upper left, subtle rim light on the right edge, gentle contact shadow, seamless very light grey background #F4F5F7, minimal, premium consumer electronics catalog, sharp focus, 85mm lens --ar 4:3 --raw --stylize 50 --no logo, text, watermark, people, hands, cable, sticker
```

**mainstream · silver · 34**

```text
studio product photograph of an unbranded 14 inch everyday laptop, matte silver finish, moderately slim body, full keyboard without numpad, lid open at 110 degrees, three-quarter view from the front left at slightly elevated angle, screen off showing flat black glass with a faint soft reflection, soft diffused key light from upper left, subtle rim light on the right edge, gentle contact shadow, seamless very light grey background #F4F5F7, clean catalog look, sharp focus, 85mm lens --ar 4:3 --raw --stylize 50 --no logo, text, watermark, people, hands, cable, sticker
```

**creator · navy · 34**

```text
studio product photograph of an unbranded 15.6 inch performance creator laptop, deep navy metal finish, slightly thicker body with discreet rear cooling vents, full keyboard with numpad, lid open at 110 degrees, three-quarter view from the front left at slightly elevated angle, screen off showing flat black glass with a faint soft reflection, soft diffused key light from upper left, subtle rim light on the right edge, gentle contact shadow, seamless very light grey background #F4F5F7, premium catalog look, sharp focus, 85mm lens --ar 4:3 --raw --stylize 50 --no logo, text, watermark, people, hands, cable, sticker, RGB lighting
```

### 4.2 Variasi warna (V7, pakai jangkar sebagai referensi)

Ganti hanya frasa warna; bentuk dijaga oleh `--oref`.

```text
[prompt jangkar bentuk yang sama, ganti "silver anodized finish" dengan "<warna>"] --v 7 --oref <URL_JANGKAR> --ow 300 --sref <URL_JANGKAR> --sw 150 --seed <SEED_BENTUK>
```

| Kode warna | Frasa warna di prompt |
| --- | --- |
| `silver` | silver anodized finish |
| `mist` | soft mist blue-grey anodized finish |
| `graphite` | dark graphite grey matte finish |
| `navy` | deep navy blue matte metal finish |

### 4.3 Sudut lain (V7, per kombinasi bentuk–warna)

Ganti kalimat sudut pada prompt jangkar:

| Sudut | Kalimat pengganti "three-quarter view from the front left at slightly elevated angle" |
| --- | --- |
| `front` | straight-on front view at eye level, screen centered and perfectly rectangular, screen off showing pure flat black glass |
| `side` | exact side profile view showing how thin the laptop is, lid open at 110 degrees |
| `ports` | close-up of the left side edge showing the ports (USB-C, USB-A, HDMI, audio jack), shallow depth of field |

Tambahkan `--oref <URL_JANGKAR_KOMBINASI> --ow 300 --sref <URL_JANGKAR> --seed <SEED_BENTUK> --v 7`.

## 5. Memilih hasil yang layak

Tolak dan ulangi (atau perbaiki dengan *Vary Region*) bila:

- Keyboard berubah bentuk atau tombolnya acak/meleleh (sering terjadi) — yang penting barisnya rapi;
  tulisan di tombol boleh samar.
- Ada logo, teks, atau tanda merek yang muncul sendiri.
- Sudut atau tinggi kamera berbeda jelas dari jangkar.
- Bayangan jatuh ke arah lain.
- Layar tidak hitam polos (untuk `front`).

## 6. Setelah generate (pasca-produksi)

Cukup taruh file mentah di `img/` dan minta diproses; langkahnya otomatis (Python + Pillow + NumPy,
di luar repo, tanpa dependency proyek):

1. **Ratakan latar** (tanpa menghapusnya): permukaan cahaya latar diukur dari tepi gambar lalu
   dinetralkan, sehingga semua latar menjadi `#EEF0F4` (selisih ±6). Latar **tidak** dibuat
   transparan karena laptop silver di atas latar abu rusak tepinya saat dipotong.
2. **Bingkai ulang**: laptop dicari otomatis lalu diskalakan agar mengisi ±80% lebar kanvas, di
   tengah. Close-up `ports` hanya dipotong tengah.
3. **Cermin** bila arah hadapnya terbalik dari render lain (contoh: `mainstream-navy-side`).
4. **Ekspor WebP** **2048 × 1536**, kualitas 80 (hasil 18–54 KB).
5. **Nama file:** `public/images/laptops/{bentuk}-{warna}-{sudut}.webp`
   - contoh: `ultrabook-silver-34.webp`, `creator-navy-front.webp`, `mainstream-graphite-ports.webp`
6. Taruh file di folder itu; pemetaan laptop → bentuk/warna sudah ada di tabel §1 dan akan
   dimasukkan ke mock (`data/laptops.ts`, field gambar).

## 7. Opsional — gambar suasana persona

Foto suasana utama di landing memakai foto CC0 (keputusan Fahren). Bila nanti ingin suasana yang
lebih "Indonesia" untuk kartu persona, prompt berikut bisa dipakai (tanpa wajah yang jelas agar
tidak terlihat seperti testimoni palsu):

```text
overhead photograph of a university student's desk in Indonesia, laptop showing code editor, notebook with handwritten notes, iced tea in a plastic cup, warm natural window light, shallow depth of field, editorial lifestyle photography, no faces, no logos --ar 4:3 --raw --stylize 75
```

Ganti isi meja per persona: *desain* (tablet gambar, sketsa warna), *umum/hukum* (buku hukum, stabilo),
*profesional* (laporan cetak, kartu nama).

## 8. Checklist serah terima

- [ ] 7 gambar `34` (prioritas 1)
- [ ] 7 gambar `front` dengan layar hitam polos (prioritas 2)
- [ ] `side` dan `ports` untuk minimal 3 bentuk (prioritas 3)
- [ ] Semua tanpa logo/teks; latar terang polos (diratakan ke `#EEF0F4` saat diproses), 2048×1536 WebP
- [ ] Nama file sesuai pola
