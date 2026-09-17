"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  BookOpen,
  Home,
  Leaf,
  Map,
  Megaphone,
  ShieldCheck,
  UserCircle2,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";

const navItems = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/peta", label: "Peta", icon: Map },
  { href: "/lapor", label: "Lapor", icon: Megaphone, highlight: true },
  { href: "/waspada", label: "Waspada", icon: Bell },
  { href: "/wiki", label: "Wiki Hama", icon: BookOpen },
];

export default function Navbar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const [mounted, setMounted] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !user) {
      setUnread(0);
      return;
    }
    let stop = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/notifications?userId=${user.id}`);
        if (!res.ok) return;
        const rows: { isRead: boolean }[] = await res.json();
        if (!stop) setUnread(rows.filter((r) => !r.isRead).length);
      } catch {
        /* abaikan */
      }
    };
    load();
    const t = setInterval(load, 20000);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, [mounted, user, pathname]);

  const isOfficer =
    mounted && user && (user.role === "OFFICER" || user.role === "ADMIN");

  return (
    <>
      {/* Bar atas */}
      <header className="sticky top-0 z-[1000] border-b border-leaf-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-leaf-600 text-white">
              <Leaf size={20} />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-leaf-800">
              Woro<span className="text-leaf-500">Tani</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-leaf-100 text-leaf-800"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                  {item.href === "/waspada" && unread > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </Link>
              );
            })}
            {isOfficer && (
              <Link
                href="/petugas"
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  pathname.startsWith("/petugas")
                    ? "bg-amber-100 text-amber-800"
                    : "text-amber-700 hover:bg-amber-50"
                }`}
              >
                <ShieldCheck size={16} />
                Petugas
              </Link>
            )}
          </nav>

          <Link
            href="/masuk"
            className="flex items-center gap-2 rounded-full border border-leaf-200 bg-leaf-50 px-3 py-1.5 text-sm font-semibold text-leaf-800 hover:bg-leaf-100"
          >
            <UserCircle2 size={18} />
            <span className="max-w-28 truncate">
              {mounted && user ? user.name.split(" ")[0] : "Masuk"}
            </span>
          </Link>
        </div>
      </header>

      {/* Bar bawah (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-[1000] border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-5">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            if (item.highlight) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex flex-col items-center pb-1.5 pt-1"
                >
                  <span className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-leaf-600 text-white shadow-lg shadow-leaf-600/40 ring-4 ring-white">
                    <item.icon size={22} />
                  </span>
                  <span className="mt-0.5 text-[10px] font-bold text-leaf-700">
                    {item.label}
                  </span>
                </Link>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold ${
                  active ? "text-leaf-700" : "text-slate-500"
                }`}
              >
                <item.icon size={20} />
                {item.label}
                {item.href === "/waspada" && unread > 0 && (
                  <span className="absolute right-4 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-0.5 text-[9px] font-bold text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
