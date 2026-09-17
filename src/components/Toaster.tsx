"use client";

import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { useToastStore } from "@/lib/store";

export default function Toaster() {
  const { toasts, remove } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[2000] flex flex-col items-center gap-2 px-4 md:bottom-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-toast-in pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur ${
            t.type === "success"
              ? "border-leaf-200 bg-leaf-50/95 text-leaf-900"
              : t.type === "error"
                ? "border-red-200 bg-red-50/95 text-red-900"
                : "border-amber-200 bg-amber-50/95 text-amber-900"
          }`}
        >
          {t.type === "success" ? (
            <CheckCircle2 className="mt-0.5 shrink-0 text-leaf-600" size={18} />
          ) : t.type === "error" ? (
            <AlertTriangle className="mt-0.5 shrink-0 text-red-600" size={18} />
          ) : (
            <Info className="mt-0.5 shrink-0 text-amber-600" size={18} />
          )}
          <p className="flex-1 text-sm font-medium">{t.message}</p>
          <button
            onClick={() => remove(t.id)}
            className="shrink-0 text-slate-400 hover:text-slate-600"
            aria-label="Tutup"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
