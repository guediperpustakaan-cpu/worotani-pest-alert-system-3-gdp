import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Bug,
  CheckCircle2,
  MapPin,
  Megaphone,
  ShieldCheck,
  Users,
} from "lucide-react";
import { db } from "@/db";
import { pests, reports, users } from "@/db/schema";
import { and, count, eq, gte } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function getStats() {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [verified] = await db
      .select({ value: count() })
      .from(reports)
      .where(eq(reports.status, "VERIFIED"));
    const [active] = await db
      .select({ value: count() })
      .from(reports)
      .where(
        and(
          eq(reports.status, "VERIFIED"),
          gte(reports.createdAt, thirtyDaysAgo)
        )
      );
    const [farmers] = await db.select({ value: count() }).from(users);
    const [pestCount] = await db.select({ value: count() }).from(pests);
    return {
      verified: verified?.value ?? 0,
      active: active?.value ?? 0,
      farmers: farmers?.value ?? 0,
      pests: pestCount?.value ?? 0,
    };
  } catch {
    return { verified: 0, active: 0, farmers: 0, pests: 0 };
  }
}

export default async function LandingPage() {
  const stats = await getStats();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-leaf-900/80 via-leaf-900/60 to-leaf-900/90" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 py-20 text-center md:py-28">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-leaf-100 backdrop-blur">
            <ShieldCheck size={14} />
            Sistem Peringatan Hama Gotong Royong
          </span>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight text-white md:text-6xl">
            Saling Jaga Lahan,{" "}
            <span className="text-warn-400">Amankan Panen</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base text-leaf-100 md:text-lg">
            Laporkan serangan hama di lahan Anda dalam hitungan detik. Petani di
            sekitar langsung menerima peringatan dini agar bisa bertindak
            sebelum terlambat.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/lapor"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-warn-400 px-8 py-4 text-lg font-extrabold text-leaf-900 shadow-xl shadow-black/20 transition hover:bg-warn-500"
            >
              <Megaphone size={22} />
              Lapor Hama Sekarang
            </Link>
            <Link
              href="/peta"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/60 px-8 py-4 text-lg font-bold text-white backdrop-blur transition hover:bg-white/10"
            >
              <MapPin size={22} />
              Lihat Peta Sebaran
            </Link>
          </div>
        </div>
      </section>

      {/* Statistik real-time */}
      <section className="mx-auto -mt-10 max-w-5xl px-4">
        <div className="relative z-10 grid grid-cols-2 gap-3 rounded-2xl border border-leaf-100 bg-white p-4 shadow-xl shadow-leaf-900/5 md:grid-cols-4 md:p-6">
          {[
            {
              icon: CheckCircle2,
              value: stats.verified,
              label: "Laporan Terverifikasi",
              color: "text-leaf-600 bg-leaf-50",
            },
            {
              icon: Bell,
              value: stats.active,
              label: "Wabah Aktif (30 hari)",
              color: "text-red-600 bg-red-50",
            },
            {
              icon: Users,
              value: stats.farmers,
              label: "Pengguna Aktif",
              color: "text-amber-600 bg-amber-50",
            },
            {
              icon: Bug,
              value: stats.pests,
              label: "Jenis Hama di Wiki",
              color: "text-sky-600 bg-sky-50",
            },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1 p-3 text-center">
              <span className={`mb-1 rounded-xl p-2.5 ${s.color}`}>
                <s.icon size={22} />
              </span>
              <span className="text-3xl font-extrabold text-slate-900">
                {s.value}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Cara kerja */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-extrabold text-slate-900 md:text-3xl">
          Bagaimana WoroTani Bekerja?
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-slate-500">
          Empat langkah sederhana untuk melindungi lahan bersama-sama.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {[
            {
              step: "1",
              icon: Megaphone,
              title: "Lapor Cepat",
              desc: "Foto hama, pilih jenisnya, lokasi GPS terdeteksi otomatis.",
            },
            {
              step: "2",
              icon: ShieldCheck,
              title: "Diverifikasi Petugas",
              desc: "Petugas penyuluh memeriksa laporan agar informasi akurat.",
            },
            {
              step: "3",
              icon: Bell,
              title: "Peringatan Menyebar",
              desc: "Petani di wilayah sekitar langsung menerima notifikasi waspada.",
            },
            {
              step: "4",
              icon: BookOpen,
              title: "Tangani Bersama",
              desc: "Baca panduan penanganan di Wiki Hama dan bertindak serempak.",
            },
          ].map((c) => (
            <div
              key={c.step}
              className="relative rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <span className="absolute right-4 top-4 text-4xl font-extrabold text-leaf-100">
                {c.step}
              </span>
              <span className="inline-flex rounded-xl bg-leaf-600 p-3 text-white">
                <c.icon size={22} />
              </span>
              <h3 className="mt-4 text-lg font-bold text-slate-900">
                {c.title}
              </h3>
              <p className="mt-1 text-sm text-slate-500">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA bawah */}
      <section className="bg-leaf-800 py-14">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 text-center">
          <h2 className="text-2xl font-extrabold text-white md:text-3xl">
            Melihat hama di lahan Anda hari ini?
          </h2>
          <p className="text-leaf-200">
            Satu laporan dari Anda bisa menyelamatkan panen satu kecamatan.
          </p>
          <Link
            href="/lapor"
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-warn-400 px-8 py-4 text-lg font-extrabold text-leaf-900 transition hover:bg-warn-500"
          >
            Lapor Hama Sekarang
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-100 bg-white py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} WoroTani — Saling Jaga Lahan, Amankan Panen.
      </footer>
    </div>
  );
}
