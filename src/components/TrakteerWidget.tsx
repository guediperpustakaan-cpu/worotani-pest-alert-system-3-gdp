"use client";

import { useState } from "react";
import { Coffee, X, GitBranch, Download, ExternalLink } from "lucide-react";

const NOMINALS = [6000, 12000, 18000, 25000, 50000, 100000];
const TRAKTEER_URL = "https://trakteer.id/perpus_opera";

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

export default function TrakteerWidget() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  const handleDonate = (nominal: number) => {
    setSelected(nominal);
    const url = `${TRAKTEER_URL}?quantity=${nominal / 1000}&step=1`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-[1000] flex items-center gap-2 rounded-full bg-amber-600 px-5 py-3 text-sm font-bold text-white shadow-xl transition hover:bg-amber-700 ${
          open ? "bg-amber-700" : ""
        }`}
        aria-label={open ? "Tutup widget traktiran" : "Buka widget traktiran"}
      >
        <Coffee size={20} />
        <span className="hidden sm:inline">Kopi untuk Server</span>
        {open && <X size={18} />}
      </button>

      {open && (
        <div className="fixed bottom-6 right-6 z-[1000] w-80 animate-toast-in">
          <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold text-slate-900">Dukung WoroTani ☕</h3>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mb-4 text-sm text-slate-600">
              Web app ini gratis & bebas iklan. Kopi kecil, server tetap jalan.
            </p>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {NOMINALS.map((n) => (
                <button
                  key={n}
                  onClick={() => handleDonate(n)}
                  className={`rounded-xl border-2 px-3 py-2.5 text-center transition ${
                    selected === n
                      ? "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-slate-200 text-slate-700 hover:border-amber-300"
                  }`}
                >
                  <div className="font-bold">{formatRupiah(n)}</div>
                  <div className="text-[10px] text-slate-500">
                    {n / 1000} kopi
                  </div>
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-xs font-bold text-slate-500 mb-2">Atau scan QR Trakteer:</p>
              <div className="inline-block bg-white p-2 rounded">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://trakteer.id/perpus_opera"
                  alt="QR Code Trakteer perpus_opera"
                  className="w-28 h-28"
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">Akan membuka halaman Trakteer</p>
            </div>

            <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-400">Open Source oleh MZF - 2026</span>
              <div className="flex gap-2">
                <a
                  href="https://github.com/MZF-DEV/worotani-pest-alert-system-3-gdp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700 transition"
                >
                  <GitBranch size={14} />
                  <Download size={14} />
                  Source Code
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}