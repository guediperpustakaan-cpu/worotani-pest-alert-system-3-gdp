"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, ShieldCheck, Tractor, UserCog } from "lucide-react";
import { useAuthStore, useToastStore } from "@/lib/store";
import type { SessionUser, UserRole } from "@/lib/types";

const roleLabel: Record<UserRole, string> = {
  FARMER: "Petani",
  OFFICER: "Petugas Penyuluh",
  ADMIN: "Admin",
};

const roleIcon: Record<UserRole, typeof Tractor> = {
  FARMER: Tractor,
  OFFICER: ShieldCheck,
  ADMIN: UserCog,
};

export default function MasukPage() {
  const [accounts, setAccounts] = useState<SessionUser[] | null>(null);
  const { user, setUser } = useAuthStore();
  const pushToast = useToastStore((s) => s.push);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then(setAccounts)
      .catch(() => setAccounts([]));
  }, []);

  const login = (acc: SessionUser) => {
    setUser(acc);
    pushToast(`Selamat datang, ${acc.name}!`, "success");
    router.push(acc.role === "FARMER" ? "/" : "/petugas");
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-extrabold text-slate-900">Masuk Akun</h1>
      <p className="mt-1 text-sm text-slate-500">
        Mode demo: pilih salah satu akun di bawah untuk mencoba peran petani,
        petugas, atau admin tanpa kata sandi.
      </p>

      {mounted && user && (
        <div className="mt-5 flex items-center justify-between rounded-xl border border-leaf-200 bg-leaf-50 p-4">
          <div>
            <p className="text-sm font-bold text-leaf-900">
              Sedang masuk sebagai {user.name}
            </p>
            <p className="text-xs text-leaf-700">
              {roleLabel[user.role]}
              {user.regionName ? ` · ${user.regionName}` : ""}
            </p>
          </div>
          <button
            onClick={() => {
              setUser(null);
              pushToast("Anda telah keluar.", "info");
            }}
            className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-bold text-red-600 shadow-sm hover:bg-red-50"
          >
            <LogOut size={14} />
            Keluar
          </button>
        </div>
      )}

      {accounts === null ? (
        <div className="mt-10 flex justify-center">
          <Loader2 className="animate-spin text-leaf-600" size={28} />
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {accounts.map((acc) => {
            const Icon = roleIcon[acc.role];
            return (
              <button
                key={acc.id}
                onClick={() => login(acc)}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-leaf-300 hover:shadow-md"
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                    acc.role === "FARMER"
                      ? "bg-leaf-100 text-leaf-700"
                      : acc.role === "OFFICER"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-sky-100 text-sky-700"
                  }`}
                >
                  <Icon size={20} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-slate-900">
                    {acc.name}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {roleLabel[acc.role]}
                    {acc.regionName ? ` · ${acc.regionName}` : ""}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
