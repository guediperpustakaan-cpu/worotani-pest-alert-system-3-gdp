"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  BellOff,
  BookOpen,
  CheckCheck,
  Crosshair,
  Loader2,
  MapPin,
  Radar,
} from "lucide-react";
import { useAuthStore, useLocationStore, useToastStore } from "@/lib/store";
import { formatDistance, haversineKm, timeAgo } from "@/lib/geo";
import type { NotificationItem, ReportItem } from "@/lib/types";
import { severityColor, severityLabel } from "@/lib/types";

export default function WaspadaPage() {
  const [tab, setTab] = useState<"sekitar" | "notifikasi">("sekitar");
  const [reports, setReports] = useState<ReportItem[] | null>(null);
  const [notifs, setNotifs] = useState<NotificationItem[] | null>(null);
  const { coords, detect, locating } = useLocationStore();
  const user = useAuthStore((s) => s.user);
  const pushToast = useToastStore((s) => s.push);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetch("/api/reports?status=VERIFIED")
      .then((r) => r.json())
      .then(setReports)
      .catch(() => setReports([]));
    if (!coords) detect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mounted || !user) return;
    fetch(`/api/notifications?userId=${user.id}`)
      .then((r) => r.json())
      .then(setNotifs)
      .catch(() => setNotifs([]));
  }, [mounted, user]);

  const sorted = useMemo(() => {
    if (!reports) return null;
    if (!coords) return reports;
    return [...reports]
      .map((r) => ({
        ...r,
        distanceKm: haversineKm(coords.lat, coords.lng, r.latitude, r.longitude),
      }))
      .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  }, [reports, coords]);

  const markAllRead = async () => {
    if (!user) return;
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });
    setNotifs((n) => n?.map((x) => ({ ...x, isRead: true })) ?? null);
    pushToast("Semua notifikasi ditandai sudah dibaca.", "info");
  };

  const unreadCount = notifs?.filter((n) => !n.isRead).length ?? 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-extrabold text-slate-900">
        Waspada Wilayah
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Wabah terverifikasi di sekitar Anda, diurutkan dari yang terdekat.
      </p>

      {/* Tab */}
      <div className="mt-5 flex gap-1.5 rounded-xl bg-slate-100 p-1.5">
        <button
          onClick={() => setTab("sekitar")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-bold transition ${
            tab === "sekitar"
              ? "bg-white text-leaf-800 shadow-sm"
              : "text-slate-500"
          }`}
        >
          <Radar size={16} />
          Sekitar Saya
        </button>
        <button
          onClick={() => setTab("notifikasi")}
          className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-bold transition ${
            tab === "notifikasi"
              ? "bg-white text-leaf-800 shadow-sm"
              : "text-slate-500"
          }`}
        >
          <Bell size={16} />
          Notifikasi
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {tab === "sekitar" && (
        <div className="mt-5 space-y-3">
          <button
            onClick={detect}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-leaf-200 bg-leaf-50 py-3 text-sm font-bold text-leaf-800 hover:bg-leaf-100"
          >
            {locating ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Crosshair size={16} />
            )}
            {coords
              ? `Lokasi terkunci (${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)}) — perbarui`
              : "Deteksi lokasi saya untuk urutan jarak"}
          </button>

          {sorted === null ? (
            [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl bg-slate-100"
              />
            ))
          ) : sorted.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center">
              <Radar className="mx-auto text-leaf-300" size={48} />
              <p className="mt-3 text-sm font-semibold text-slate-500">
                Belum ada wabah terverifikasi. Lahan Anda aman untuk saat ini. 🌾
              </p>
            </div>
          ) : (
            sorted.map((r) => (
              <div
                key={r.id}
                className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
              >
                {r.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.photoUrl}
                    alt={r.pestName}
                    className="h-20 w-20 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <span
                    className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl text-3xl"
                    style={{
                      background: `${severityColor[r.severityLevel]}20`,
                    }}
                  >
                    🐛
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-extrabold text-slate-900">
                      {r.pestName}
                    </p>
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                      style={{ background: severityColor[r.severityLevel] }}
                    >
                      {severityLabel[r.severityLevel]}
                    </span>
                  </div>
                  <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-slate-500">
                    <MapPin size={12} />
                    {r.distanceKm != null
                      ? `${formatDistance(r.distanceKm)} dari Anda`
                      : (r.regionName ?? "Lokasi terlampir")}
                    <span className="text-slate-300">·</span>
                    {timeAgo(r.createdAt)}
                  </p>
                  {r.additionalNote && (
                    <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                      {r.additionalNote}
                    </p>
                  )}
                  <Link
                    href={`/wiki/${r.pestId}`}
                    className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-leaf-700 hover:underline"
                  >
                    <BookOpen size={12} />
                    Panduan penanganan
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "notifikasi" && (
        <div className="mt-5 space-y-3">
          {!mounted || !user ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center">
              <BellOff className="mx-auto text-slate-300" size={48} />
              <p className="mt-3 text-sm font-semibold text-slate-500">
                Masuk terlebih dahulu untuk melihat notifikasi Anda.
              </p>
              <Link
                href="/masuk"
                className="mt-4 inline-block rounded-xl bg-leaf-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-leaf-700"
              >
                Masuk
              </Link>
            </div>
          ) : notifs === null ? (
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-2xl bg-slate-100"
              />
            ))
          ) : notifs.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center">
              <BellOff className="mx-auto text-slate-300" size={48} />
              <p className="mt-3 text-sm font-semibold text-slate-500">
                Belum ada notifikasi untuk Anda.
              </p>
            </div>
          ) : (
            <>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1.5 text-xs font-bold text-leaf-700 hover:underline"
                >
                  <CheckCheck size={14} />
                  Tandai semua sudah dibaca
                </button>
              )}
              {notifs.map((n) => (
                <div
                  key={n.id}
                  className={`rounded-2xl border p-4 ${
                    n.isRead
                      ? "border-slate-100 bg-white"
                      : "border-warn-400/50 bg-amber-50"
                  }`}
                >
                  <p className="text-sm font-medium text-slate-800">
                    {n.message}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-slate-400">
                    {timeAgo(n.createdAt)}
                    {!n.isRead && (
                      <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                        Baru
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
