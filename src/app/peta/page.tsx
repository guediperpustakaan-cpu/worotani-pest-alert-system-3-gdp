"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Crosshair, Loader2 } from "lucide-react";
import { useLocationStore, useToastStore } from "@/lib/store";
import type { ReportItem, Severity } from "@/lib/types";
import { severityColor, severityLabel } from "@/lib/types";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-leaf-50">
      <Loader2 className="animate-spin text-leaf-600" size={32} />
    </div>
  ),
});

export default function PetaPage() {
  const [reports, setReports] = useState<ReportItem[] | null>(null);
  const [filter, setFilter] = useState<Severity | "ALL">("ALL");
  const { coords, detect, locating, error } = useLocationStore();
  const pushToast = useToastStore((s) => s.push);

  useEffect(() => {
    fetch("/api/reports?status=VERIFIED")
      .then((r) => r.json())
      .then(setReports)
      .catch(() => setReports([]));
  }, []);

  useEffect(() => {
    if (error) pushToast(error, "info");
  }, [error, pushToast]);

  const filtered = useMemo(
    () =>
      (reports ?? []).filter(
        (r) => filter === "ALL" || r.severityLevel === filter
      ),
    [reports, filter]
  );

  return (
    <div className="relative h-[calc(100dvh-3.5rem-5rem)] md:h-[calc(100dvh-3.5rem)]">
      <MapView
        reports={filtered}
        userLocation={coords}
        center={coords ?? { lat: -7.7456, lng: 110.3695 }}
        className="h-full"
      />

      {/* Filter tingkat bahaya */}
      <div className="absolute left-1/2 top-3 z-[500] flex -translate-x-1/2 gap-1.5 rounded-full bg-white/95 p-1.5 shadow-lg backdrop-blur">
        {(["ALL", "LOW", "MEDIUM", "HIGH"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
              filter === f
                ? "bg-leaf-700 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {f === "ALL" ? "Semua" : severityLabel[f]}
          </button>
        ))}
      </div>

      {/* Legenda */}
      <div className="absolute bottom-6 left-3 z-[500] rounded-xl bg-white/95 p-3 text-xs shadow-lg backdrop-blur">
        <p className="mb-2 font-bold text-slate-700">Tingkat Bahaya</p>
        {(["HIGH", "MEDIUM", "LOW"] as Severity[]).map((s) => (
          <div key={s} className="mb-1 flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ background: severityColor[s] }}
            />
            <span className="font-medium text-slate-600">
              {severityLabel[s]}
            </span>
          </div>
        ))}
        <p className="mt-2 border-t border-slate-100 pt-2 text-[11px] text-slate-400">
          {reports === null
            ? "Memuat laporan..."
            : `${filtered.length} laporan terverifikasi`}
        </p>
      </div>

      {/* Tombol lokasi saya */}
      <button
        onClick={detect}
        className="absolute bottom-6 right-3 z-[500] flex items-center gap-2 rounded-full bg-leaf-700 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-leaf-800"
      >
        {locating ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <Crosshair size={18} />
        )}
        Lokasi Saya
      </button>
    </div>
  );
}
