"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, Search } from "lucide-react";
import type { PestItem } from "@/lib/types";
import { severityColor, severityLabel } from "@/lib/types";

export default function WikiPage() {
  const [q, setQ] = useState("");
  const [pests, setPests] = useState<PestItem[] | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setPests(null);
      fetch(`/api/pests?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then(setPests)
        .catch(() => setPests([]));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900">
        <BookOpen className="text-leaf-600" size={26} />
        Wiki Hama
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Kenali musuh lahan Anda: gejala serangan dan panduan penanganannya.
      </p>

      <div className="relative mt-5">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari nama hama atau gejala, mis. 'daun menguning'..."
          className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm shadow-sm outline-none focus:border-leaf-400 focus:ring-2 focus:ring-leaf-100"
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {pests === null ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-slate-100" />
          ))
        ) : pests.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-slate-100 bg-white p-10 text-center text-sm font-semibold text-slate-500">
            Tidak ditemukan hama yang cocok dengan “{q}”.
          </div>
        ) : (
          pests.map((p) => (
            <Link
              key={p.id}
              href={`/wiki/${p.id}`}
              className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {p.imageGuideUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.imageGuideUrl}
                  alt={p.pestName}
                  className="h-36 w-full object-cover transition group-hover:scale-[1.02]"
                />
              )}
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="truncate text-base font-extrabold text-slate-900">
                    {p.pestName}
                  </h2>
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                    style={{ background: severityColor[p.severityLevel] }}
                  >
                    {severityLabel[p.severityLevel]}
                  </span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs text-slate-500">
                  {p.description}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-leaf-700">
                  Baca panduan penanganan
                  <ChevronRight size={14} />
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
