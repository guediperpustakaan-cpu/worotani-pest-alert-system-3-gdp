import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  ClipboardList,
  Info,
  Megaphone,
} from "lucide-react";
import { db } from "@/db";
import { pests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { severityColor, severityLabel } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function WikiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pestId = Number(id);
  if (!Number.isInteger(pestId)) notFound();

  const [pest] = await db.select().from(pests).where(eq(pests.id, pestId));
  if (!pest) notFound();

  const steps = pest.treatmentGuide
    .split("\n")
    .map((s) => s.replace(/^\d+\.\s*/, "").trim())
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Link
        href="/wiki"
        className="inline-flex items-center gap-1 text-sm font-bold text-leaf-700 hover:underline"
      >
        <ArrowLeft size={16} />
        Kembali ke Wiki Hama
      </Link>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {pest.imageGuideUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pest.imageGuideUrl}
            alt={pest.pestName}
            className="h-56 w-full object-cover md:h-72"
          />
        )}
        <div className="p-5 md:p-7">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900">
              {pest.pestName}
            </h1>
            <span
              className="rounded-full px-3 py-1 text-xs font-bold text-white"
              style={{ background: severityColor[pest.severityLevel] }}
            >
              Tingkat {severityLabel[pest.severityLevel]}
            </span>
          </div>

          <section className="mt-6">
            <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
              <Info className="text-leaf-600" size={18} />
              Tentang Hama Ini
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {pest.description}
            </p>
          </section>

          <section className="mt-6 rounded-xl border border-amber-100 bg-amber-50 p-4">
            <h2 className="flex items-center gap-2 text-base font-extrabold text-amber-900">
              <Activity className="text-amber-600" size={18} />
              Gejala Serangan
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-amber-900/80">
              {pest.symptoms}
            </p>
          </section>

          <section className="mt-6">
            <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
              <ClipboardList className="text-leaf-600" size={18} />
              Panduan Penanganan
            </h2>
            <ol className="mt-3 space-y-2.5">
              {steps.map((s, i) => (
                <li key={i} className="flex gap-3 rounded-xl bg-leaf-50 p-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-leaf-600 text-sm font-extrabold text-white">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-leaf-900">{s}</p>
                </li>
              ))}
            </ol>
          </section>

          <Link
            href="/lapor"
            className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-warn-400 px-6 py-4 text-base font-extrabold text-leaf-900 transition hover:bg-warn-500"
          >
            <Megaphone size={20} />
            Menemukan hama ini? Lapor Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}
