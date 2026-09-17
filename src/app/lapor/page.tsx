"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bug,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  ImagePlus,
  Loader2,
  MapPin,
  Send,
  UserCircle2,
  X,
} from "lucide-react";
import { useAuthStore, useLocationStore, useToastStore } from "@/lib/store";
import type { PestItem } from "@/lib/types";
import { severityColor, severityLabel } from "@/lib/types";

const steps = ["Foto", "Jenis Hama", "Lokasi & Kirim"];

async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 720;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function LaporPage() {
  const [step, setStep] = useState(0);
  const [photo, setPhoto] = useState<string | null>(null);
  const [pests, setPests] = useState<PestItem[] | null>(null);
  const [pestId, setPestId] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const user = useAuthStore((s) => s.user);
  const { coords, detect, locating, error } = useLocationStore();
  const pushToast = useToastStore((s) => s.push);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetch("/api/pests")
      .then((r) => r.json())
      .then(setPests)
      .catch(() => setPests([]));
  }, []);

  useEffect(() => {
    if (step === 2 && !coords) detect();
  }, [step, coords, detect]);

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    try {
      setPhoto(await compressImage(file));
    } catch {
      pushToast("Gagal membaca foto. Coba foto lain.", "error");
    }
  };

  const submit = async () => {
    if (!user) return;
    if (!pestId || !coords) {
      pushToast("Lengkapi jenis hama dan lokasi terlebih dahulu.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          pestId,
          latitude: coords.lat,
          longitude: coords.lng,
          photoUrl: photo,
          additionalNote: note,
        }),
      });
      if (!res.ok) throw new Error();
      pushToast(
        "Laporan terkirim! Petugas akan memverifikasi secepatnya. 🌾",
        "success"
      );
      router.push("/waspada");
    } catch {
      pushToast("Gagal mengirim laporan. Periksa koneksi Anda.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (mounted && !user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <UserCircle2 className="mx-auto text-leaf-300" size={64} />
        <h1 className="mt-4 text-xl font-extrabold text-slate-900">
          Masuk Dulu, Ya
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Untuk melapor hama, Anda perlu masuk terlebih dahulu agar petugas tahu
          siapa pelapornya.
        </p>
        <Link
          href="/masuk"
          className="mt-6 inline-block rounded-xl bg-leaf-600 px-8 py-3.5 text-base font-bold text-white hover:bg-leaf-700"
        >
          Pilih Akun Demo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <h1 className="text-2xl font-extrabold text-slate-900">
        Lapor Hama Cepat
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Tiga langkah singkat — bantu petani sekitar bersiap lebih awal.
      </p>

      {/* Indikator langkah */}
      <div className="mt-6 flex items-center">
        {steps.map((label, i) => (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                  i < step
                    ? "bg-leaf-600 text-white"
                    : i === step
                      ? "bg-leaf-600 text-white ring-4 ring-leaf-100"
                      : "bg-slate-200 text-slate-500"
                }`}
              >
                {i < step ? <Check size={16} /> : i + 1}
              </span>
              <span
                className={`mt-1 text-[10px] font-bold ${
                  i <= step ? "text-leaf-700" : "text-slate-400"
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mx-2 mb-4 h-1 flex-1 rounded ${
                  i < step ? "bg-leaf-500" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        {/* Langkah 1: Foto */}
        {step === 0 && (
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Camera className="text-leaf-600" size={20} />
              Foto Kondisi Lahan / Hama
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Foto membantu petugas memverifikasi lebih cepat. Boleh dilewati
              jika sulit.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            {photo ? (
              <div className="relative mt-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo}
                  alt="Pratinjau foto laporan"
                  className="h-56 w-full rounded-xl object-cover"
                />
                <button
                  onClick={() => setPhoto(null)}
                  className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white"
                  aria-label="Hapus foto"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="mt-4 flex h-44 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-leaf-300 bg-leaf-50 text-leaf-700 transition hover:bg-leaf-100"
              >
                <ImagePlus size={32} />
                <span className="text-sm font-bold">
                  Ketuk untuk ambil / pilih foto
                </span>
              </button>
            )}
          </div>
        )}

        {/* Langkah 2: Jenis hama */}
        {step === 1 && (
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Bug className="text-leaf-600" size={20} />
              Pilih Jenis Hama
            </h2>
            {pests === null ? (
              <div className="mt-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-14 animate-pulse rounded-xl bg-slate-100"
                  />
                ))}
              </div>
            ) : (
              <div className="mt-4 space-y-2.5">
                {pests.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPestId(p.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition ${
                      pestId === p.id
                        ? "border-leaf-500 bg-leaf-50"
                        : "border-slate-100 bg-white hover:border-leaf-200"
                    }`}
                  >
                    {p.imageGuideUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageGuideUrl}
                        alt={p.pestName}
                        className="h-12 w-12 shrink-0 rounded-lg object-cover"
                      />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-slate-900">
                        {p.pestName}
                      </span>
                      <span
                        className="mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                        style={{ background: severityColor[p.severityLevel] }}
                      >
                        {severityLabel[p.severityLevel]}
                      </span>
                    </span>
                    {pestId === p.id && (
                      <Check className="shrink-0 text-leaf-600" size={20} />
                    )}
                  </button>
                ))}
              </div>
            )}
            <label className="mt-5 block text-sm font-bold text-slate-700">
              Catatan Tambahan (opsional)
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Contoh: serangan mulai dari petak sebelah timur, sekitar 20 rumpun terdampak..."
                className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal outline-none focus:border-leaf-400 focus:ring-2 focus:ring-leaf-100"
              />
            </label>
          </div>
        )}

        {/* Langkah 3: Lokasi */}
        {step === 2 && (
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <MapPin className="text-leaf-600" size={20} />
              Lokasi Kejadian
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Koordinat GPS terdeteksi otomatis dari perangkat Anda.
            </p>
            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              {coords ? (
                <div className="flex items-center gap-3">
                  <span className="relative flex h-4 w-4">
                    <span className="absolute h-full w-full rounded-full bg-leaf-400 [animation:pulse-ring_1.5s_ease-out_infinite]" />
                    <span className="relative h-4 w-4 rounded-full border-2 border-white bg-leaf-600" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {error ?? "Lokasi GPS berhasil terkunci"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  {locating ? "Mencari sinyal GPS..." : "Lokasi belum terdeteksi."}
                </p>
              )}
              <button
                onClick={detect}
                className="mt-3 flex items-center gap-2 rounded-lg bg-leaf-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-leaf-700"
              >
                {locating ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Crosshair size={16} />
                )}
                Deteksi Ulang Lokasi
              </button>
            </div>

            {/* Ringkasan */}
            <div className="mt-5 rounded-xl border border-leaf-100 bg-leaf-50 p-4 text-sm">
              <p className="font-bold text-leaf-900">Ringkasan Laporan</p>
              <ul className="mt-2 space-y-1 text-leaf-800">
                <li>
                  🐛 Hama:{" "}
                  <b>
                    {pests?.find((p) => p.id === pestId)?.pestName ??
                      "Belum dipilih"}
                  </b>
                </li>
                <li>📷 Foto: {photo ? "Terlampir" : "Tidak ada"}</li>
                <li>
                  📍 Lokasi:{" "}
                  {coords
                    ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
                    : "Belum terdeteksi"}
                </li>
                <li>👤 Pelapor: {user?.name}</li>
              </ul>
            </div>
          </div>
        )}

        {/* Navigasi langkah */}
        <div className="mt-6 flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 rounded-xl border border-slate-200 px-5 py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
            >
              <ChevronLeft size={18} />
              Kembali
            </button>
          )}
          {step < 2 ? (
            <button
              onClick={() => {
                if (step === 1 && !pestId) {
                  pushToast("Pilih jenis hama terlebih dahulu.", "error");
                  return;
                }
                setStep(step + 1);
              }}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-leaf-600 px-5 py-3.5 text-base font-bold text-white hover:bg-leaf-700"
            >
              Lanjut
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={submitting || !pestId || !coords}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-warn-400 px-5 py-3.5 text-base font-extrabold text-leaf-900 hover:bg-warn-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Send size={20} />
              )}
              Kirim Laporan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
