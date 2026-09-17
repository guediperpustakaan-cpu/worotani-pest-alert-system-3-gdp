"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Flame,
  Loader2,
  Lock,
  MapPin,
  Radio,
  Send,
  XCircle,
} from "lucide-react";
import { useAuthStore, useToastStore } from "@/lib/store";
import { timeAgo } from "@/lib/geo";
import type { ReportItem, Severity } from "@/lib/types";
import { severityColor, severityLabel } from "@/lib/types";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-leaf-50">
      <Loader2 className="animate-spin text-leaf-600" size={28} />
    </div>
  ),
});

interface Analytics {
  byPest: { pestName: string; severity: Severity; total: number }[];
  byMonth: { month: string; total: number }[];
  byStatus: { status: string; total: number }[];
  heatPoints: { latitude: number; longitude: number; severity: Severity }[];
}

interface Region {
  id: number;
  regionName: string;
}

const monthName = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1).toLocaleDateString("id-ID", {
    month: "short",
    year: "2-digit",
  });
};

export default function PetugasPage() {
  const [tab, setTab] = useState<"verifikasi" | "siaran" | "analitik">(
    "verifikasi"
  );
  const [queue, setQueue] = useState<ReportItem[] | null>(null);
  const [acting, setActing] = useState<number | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [regionId, setRegionId] = useState<string>("0");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const user = useAuthStore((s) => s.user);
  const pushToast = useToastStore((s) => s.push);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadQueue = () => {
    fetch("/api/reports?status=PENDING")
      .then((r) => r.json())
      .then(setQueue)
      .catch(() => setQueue([]));
  };

  useEffect(() => {
    loadQueue();
    fetch("/api/regions")
      .then((r) => r.json())
      .then(setRegions)
      .catch(() => setRegions([]));
  }, []);

  useEffect(() => {
    if (tab === "analitik" && !analytics) {
      fetch("/api/analytics")
        .then((r) => r.json())
        .then(setAnalytics)
        .catch(() => null);
    }
  }, [tab, analytics]);

  const decide = async (id: number, status: "VERIFIED" | "REJECTED") => {
    setActing(id);
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setQueue((q) => q?.filter((r) => r.id !== id) ?? null);
      pushToast(
        status === "VERIFIED"
          ? "Laporan diverifikasi. Peringatan dikirim ke petani sekitar. ✅"
          : "Laporan ditolak dan pelapor telah diberi tahu.",
        status === "VERIFIED" ? "success" : "info"
      );
    } catch {
      pushToast("Gagal memproses laporan.", "error");
    } finally {
      setActing(null);
    }
  };

  const broadcast = async () => {
    if (!message.trim()) {
      pushToast("Tulis pesan siaran terlebih dahulu.", "error");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regionId: Number(regionId), message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      pushToast(
        `Siaran terkirim ke ${data.sentTo} pengguna di ${data.regionName}. 📢`,
        "success"
      );
      setMessage("");
    } catch {
      pushToast("Gagal mengirim siaran.", "error");
    } finally {
      setSending(false);
    }
  };

  if (mounted && (!user || user.role === "FARMER")) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <Lock className="mx-auto text-slate-300" size={56} />
        <h1 className="mt-4 text-xl font-extrabold text-slate-900">
          Khusus Petugas & Admin
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Halaman ini hanya bisa diakses oleh akun petugas penyuluh atau admin.
        </p>
        <Link
          href="/masuk"
          className="mt-6 inline-block rounded-xl bg-leaf-600 px-8 py-3.5 text-base font-bold text-white hover:bg-leaf-700"
        >
          Masuk sebagai Petugas
        </Link>
      </div>
    );
  }

  const maxPest = Math.max(1, ...(analytics?.byPest.map((p) => p.total) ?? []));
  const maxMonth = Math.max(
    1,
    ...(analytics?.byMonth.map((m) => m.total) ?? [])
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-2xl font-extrabold text-slate-900">
        Dasbor Petugas
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Verifikasi laporan, kirim siaran wilayah, dan pantau analitik sebaran.
      </p>

      <div className="mt-5 flex gap-1.5 overflow-x-auto rounded-xl bg-slate-100 p-1.5">
        {(
          [
            { key: "verifikasi", label: "Antrean Verifikasi", icon: ClipboardCheck },
            { key: "siaran", label: "Siaran Wilayah", icon: Radio },
            { key: "analitik", label: "Analitik", icon: BarChart3 },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-bold transition ${
              tab === t.key
                ? "bg-white text-leaf-800 shadow-sm"
                : "text-slate-500"
            }`}
          >
            <t.icon size={16} />
            {t.label}
            {t.key === "verifikasi" && queue && queue.length > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                {queue.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ===== Antrean Verifikasi ===== */}
      {tab === "verifikasi" && (
        <div className="mt-5 space-y-4">
          {queue === null ? (
            [1, 2].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-100" />
            ))
          ) : queue.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center">
              <CheckCircle2 className="mx-auto text-leaf-300" size={48} />
              <p className="mt-3 text-sm font-semibold text-slate-500">
                Antrean kosong. Semua laporan sudah diproses. 👍
              </p>
            </div>
          ) : (
            queue.map((r) => (
              <div
                key={r.id}
                className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
              >
                <div className="flex flex-col sm:flex-row">
                  {r.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.photoUrl}
                      alt={r.pestName}
                      className="h-44 w-full object-cover sm:h-auto sm:w-48"
                    />
                  ) : (
                    <div className="flex h-32 w-full items-center justify-center bg-slate-50 text-4xl sm:h-auto sm:w-48">
                      🐛
                    </div>
                  )}
                  <div className="flex-1 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                        #{r.id}
                      </span>
                      <h2 className="text-base font-extrabold text-slate-900">
                        {r.pestName}
                      </h2>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                        style={{ background: severityColor[r.severityLevel] }}
                      >
                        {severityLabel[r.severityLevel]}
                      </span>
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-500">
                      <MapPin size={12} />
                      {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}
                      <span className="text-slate-300">·</span>
                      {r.reporterName}
                      <span className="text-slate-300">·</span>
                      {timeAgo(r.createdAt)}
                    </p>
                    {r.additionalNote && (
                      <p className="mt-2 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600">
                        “{r.additionalNote}”
                      </p>
                    )}
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => decide(r.id, "VERIFIED")}
                        disabled={acting === r.id}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-leaf-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-leaf-700 disabled:opacity-50"
                      >
                        {acting === r.id ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                        Verifikasi
                      </button>
                      <button
                        onClick={() => decide(r.id, "REJECTED")}
                        disabled={acting === r.id}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
                      >
                        <XCircle size={16} />
                        Tolak
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ===== Siaran ===== */}
      {tab === "siaran" && (
        <div className="mt-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Radio className="text-amber-600" size={20} />
            Kirim Siaran Prioritas
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Pesan akan masuk ke notifikasi seluruh pengguna di wilayah terpilih.
          </p>
          <label className="mt-4 block text-sm font-bold text-slate-700">
            Wilayah Tujuan
            <select
              value={regionId}
              onChange={(e) => setRegionId(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal outline-none focus:border-leaf-400"
            >
              <option value="0">Semua Wilayah</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.regionName}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-4 block text-sm font-bold text-slate-700">
            Isi Pesan
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Contoh: Ditemukan lonjakan populasi wereng di Godean. Petani dimohon memeriksa pangkal rumpun hari ini dan menunda penyemprotan berspektrum luas..."
              className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal outline-none focus:border-leaf-400 focus:ring-2 focus:ring-leaf-100"
            />
          </label>
          <button
            onClick={broadcast}
            disabled={sending}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-base font-extrabold text-white hover:bg-amber-600 disabled:opacity-50"
          >
            {sending ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Send size={20} />
            )}
            Kirim Siaran Sekarang
          </button>
        </div>
      )}

      {/* ===== Analitik ===== */}
      {tab === "analitik" && (
        <div className="mt-5 space-y-5">
          {!analytics ? (
            <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
          ) : (
            <>
              {/* Peta panas */}
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-100 p-4">
                  <Flame className="text-red-500" size={18} />
                  <h2 className="text-sm font-extrabold text-slate-900">
                    Peta Panas Sebaran Hama (Terverifikasi)
                  </h2>
                </div>
                <div className="h-72">
                  <MapView
                    heatPoints={analytics.heatPoints}
                    center={{ lat: -7.7456, lng: 110.3695 }}
                    zoom={11}
                    className="h-full"
                  />
                </div>
              </div>

              {/* Hama terbanyak */}
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-extrabold text-slate-900">
                  Hama Paling Sering Dilaporkan
                </h2>
                <div className="mt-4 space-y-3">
                  {analytics.byPest.map((p) => (
                    <div key={p.pestName}>
                      <div className="mb-1 flex justify-between text-xs font-bold">
                        <span className="text-slate-700">{p.pestName}</span>
                        <span className="text-slate-400">{p.total} laporan</span>
                      </div>
                      <div className="h-3 rounded-full bg-slate-100">
                        <div
                          className="h-3 rounded-full transition-all"
                          style={{
                            width: `${(p.total / maxPest) * 100}%`,
                            background: severityColor[p.severity],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tren bulanan */}
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-extrabold text-slate-900">
                  Tren Laporan per Bulan
                </h2>
                <div className="mt-4 flex h-40 items-end gap-2">
                  {analytics.byMonth.map((m) => (
                    <div
                      key={m.month}
                      className="flex flex-1 flex-col items-center gap-1"
                    >
                      <span className="text-[10px] font-bold text-slate-500">
                        {m.total}
                      </span>
                      <div
                        className="w-full rounded-t-lg bg-leaf-500 transition-all"
                        style={{
                          height: `${Math.max(8, (m.total / maxMonth) * 120)}px`,
                        }}
                      />
                      <span className="text-[10px] font-semibold text-slate-400">
                        {monthName(m.month)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status ringkas */}
              <div className="grid grid-cols-3 gap-3">
                {analytics.byStatus.map((s) => (
                  <div
                    key={s.status}
                    className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm"
                  >
                    <p className="text-2xl font-extrabold text-slate-900">
                      {s.total}
                    </p>
                    <p className="text-[11px] font-bold text-slate-500">
                      {s.status === "VERIFIED"
                        ? "Terverifikasi"
                        : s.status === "PENDING"
                          ? "Menunggu"
                          : "Ditolak"}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
