# WoroTani — Sistem Peringatan Hama Gotong Royong

> **Saling Jaga Lahan, Amankan Panen.**  
> Aplikasi web untuk melaporkan serangan hama, memantau peta sebaran, dan menerima peringatan dini secara real-time — dibangun untuk petani, petugas penyuluh, dan admin pertanian.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/MZF-DEV/worotani-pest-alert-system-3-gdp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-green)](https://orm.drizzle.team/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 📍 **Lapor Hama** | Foto + GPS otomatis + pilih jenis hama + catatan → dikirim ke antrean verifikasi |
| ✅ **Verifikasi Petugas** | Petugas menyetujui/tolak laporan → notifikasi otomatis ke pelapor & petani sekitar |
| 🔔 **Peringatan Dini (Waspada)** | Wabah terverifikasi diurutkan jarak dari lokasi user + notifikasi real-time |
| 🗺️ **Peta Sebaran Interaktif** | Leaflet + marker severity (merah/kuning/hijau) + heatmap wabah |
| 📚 **Wiki Hama** | 6 hama utama (wereng, penggerek, tikus, walang, ulat grayak, keong) dengan gejala & panduan penanganan |
| 📊 **Dasbor Petugas** | Antrean verifikasi, siaran wilayah, analitik (tren bulanan, hama terbanyak, peta panas) |
| 👥 **Multi-Role** | FARMER (lapor/terima notif), OFFICER (verifikasi/siaran/analitik), ADMIN (full access) |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript 5 (strict mode)
- **Database**: PostgreSQL (Neon / Vercel Postgres) via Drizzle ORM
- **Styling**: Tailwind CSS 4 (custom theme `leaf`, `warn`)
- **State**: Zustand (auth, location, toast) + React hooks
- **Map**: React-Leaflet + OpenStreetMap
- **Icons**: Lucide React
- **Lint/Format**: ESLint (Next core-web-vitals)

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/MZF-DEV/worotani-pest-alert-system-3-gdp.git
cd worotani-pest-alert-system-3-gdp
npm install
```

### 2. Database Setup (Neon / PostgreSQL)

Buat database di [Neon](https://neon.tech) atau PostgreSQL lokal, lalu jalankan schema:

```bash
# Via psql
psql "postgresql://user:pass@host/db" -f neon-schema.sql

# Atau copy-paste isi neon-schema.sql ke Neon SQL Editor
```

Schema mencakup:
- 5 tabel: `regions`, `users`, `pests`, `reports`, `notifications`
- Enum: `user_role`, `severity_level`, `report_status`
- Index untuk performa query
- Seed data: 6 wilayah, 8 user demo, 6 hama, 15 laporan, 7 notifikasi

### 3. Environment Variables

Buat `.env.local`:

```env
DATABASE_URL=postgresql://neondb_owner:xxx@ep-xxx-pooler.aws.neon.tech/neondb?sslmode=require
```

### 4. Development

```bash
npm run dev
# Buka http://localhost:3000
```

### 5. Build & Deploy (Vercel)

```bash
npm run build   # Verifikasi build sukses
npm run lint    # Cek kode
npm run typecheck
```

Deploy ke Vercel:
1. Push ke GitHub
2. Import project di Vercel
3. Set `DATABASE_URL` di Environment Variables
4. Deploy

---

## 👤 Akun Demo (Setelah Seed)

| Role | Email | Password | Akses |
|------|-------|----------|-------|
| Petani | slamet@worotani.id | demo123 | Lapor, Lihat Peta, Waspada, Wiki |
| Petani | sri@worotani.id | demo123 | ... |
| Petugas | ratna@worotani.id | demo123 | Verifikasi, Siaran, Analitik |
| Admin | admin@worotani.id | demo123 | Semua akses |

> Akses via `/masuk` → pilih akun (tanpa password di mode demo).

---

## 📁 Struktur Project

```
src/
├── app/
│   ├── api/              # API Routes (REST)
│   │   ├── pests/        # CRUD hama + search
│   │   ├── reports/      # CRUD laporan + verifikasi
│   │   ├── regions/      # Daftar wilayah
│   │   ├── users/        # Daftar user (demo)
│   │   ├── notifications/# Notifikasi user
│   │   ├── stats/        # Statistik real-time
│   │   ├── analytics/    # Data chart dasbor petugas
│   │   ├── broadcast/    # Siaran wilayah
│   │   └── health/       # Health check DB
│   ├── lapor/            # Halaman lapor hama (3 step)
│   ├── peta/             # Peta sebaran interaktif
│   ├── waspada/          # Peringatan dini + notifikasi
│   ├── wiki/             # Wiki hama (list + detail)
│   ├── petugas/          # Dasbor petugas (3 tab)
│   ├── masuk/            # Login demo
│   ├── layout.tsx        # Root layout + providers
│   ├── page.tsx          # Landing page
│   └── globals.css       # Tailwind + custom theme
├── components/
│   ├── Navbar.tsx        # Navigasi responsive (top + bottom)
│   ├── MapView.tsx       # Wrapper Leaflet (marker + heatmap)
│   ├── Toaster.tsx       # Toast notifications
│   └── TrakteerWidget.tsx# Floating donate widget
├── db/
│   ├── index.ts          # Drizzle client (lazy init)
│   ├── schema.ts         # Schema tabel + enum
│   └── seed.sql          # Data seed (idempotent)
├── lib/
│   ├── geo.ts            # Haversine, formatDistance, timeAgo
│   ├── store.ts          # Zustand stores (auth, location, toast)
│   └── types.ts          # TypeScript interfaces + constants
├── neon-schema.sql       # Schema SQL untuk Neon/PostgreSQL
└── ...
```

---

## 🔧 Scripts

```bash
npm run dev       # Development server (Turbopack)
npm run build     # Production build
npm run start     # Run production build
npm run lint      # ESLint
npm run typecheck # TypeScript check
```

---

## 📦 Database Schema (Ringkas)

```sql
-- Enum
user_role: FARMER | OFFICER | ADMIN
severity_level: LOW | MEDIUM | HIGH
report_status: PENDING | VERIFIED | REJECTED

-- Tables
regions(id, region_name)
users(id, name, email, password, phone, role, region_id)
pests(id, pest_name, description, symptoms, treatment_guide, image_guide_url, severity_level)
reports(id, user_id, pest_id, lat, lng, photo_url, note, status, created_at)
notifications(id, user_id, message, is_read, created_at)
```

---

## 🎨 Custom Theme (Tailwind)

```css
/* globals.css */
@theme {
  --color-leaf-50:  #f2f9f0;  --color-leaf-500: #459c35;
  --color-leaf-100: #e0f2db;  --color-leaf-600: #337d27;
  --color-leaf-200: #c2e5ba;  --color-leaf-700: #2a6221;
  --color-leaf-300: #96d189;  --color-leaf-800: #244e1f;
  --color-leaf-400: #67b756;  --color-leaf-900: #1e411c;
  --color-warn-400: #facc15;  --color-warn-500: #eab308;
  --font-sans: "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;
}
```

---

## 🤝 Kontribusi

1. Fork repo ini
2. Buat branch: `git checkout -b feature/nama-fitur`
3. Commit: `git commit -m "feat: deskripsi singkat"`
4. Push: `git push origin feature/nama-fitur`
5. Buat Pull Request

---

## 📄 Lisensi

MIT License — bebas digunakan, dimodifikasi, dan didistribusikan.

---

## 💖 Dukung Proyek Ini

Web app ini **gratis & bebas iklan**.  
Kopi kecil, server tetap jalan ☕

[![Trakteer](https://img.shields.io/badge/🍵%20Trakteer-perpus_opera-FF6B35?style=for-the-badge)](https://trakteer.id/perpus_opera)

---

## 👨‍💻 Author

**MZF** — *Open Source oleh MZF - 2026*

- GitHub: [@MZF-DEV](https://github.com/MZF-DEV)
- Repository: [worotani-pest-alert-system-3-gdp](https://github.com/MZF-DEV/worotani-pest-alert-system-3-gdp)

> Dibangun dengan ❤️ untuk petani Indonesia.  
> *Saling Jaga Lahan, Amankan Panen.*