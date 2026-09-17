import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Toaster from "@/components/Toaster";

export const metadata: Metadata = {
  title: "WoroTani — Sistem Peringatan Hama Gotong Royong",
  description:
    "Saling Jaga Lahan, Amankan Panen. Lapor hama, lihat peta sebaran, dan terima peringatan dini dari petani sekitar.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-800 antialiased">
        <Navbar />
        <main className="pb-20 md:pb-0">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
