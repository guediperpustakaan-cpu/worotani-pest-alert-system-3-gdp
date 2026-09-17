"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SessionUser } from "./types";

interface AuthState {
  user: SessionUser | null;
  setUser: (user: SessionUser | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    { name: "worotani-auth" }
  )
);

interface LocationState {
  coords: { lat: number; lng: number } | null;
  locating: boolean;
  error: string | null;
  detect: () => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  coords: null,
  locating: false,
  error: null,
  detect: () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      set({
        // Fallback: pusat area demo (Sleman, DIY)
        coords: { lat: -7.7156, lng: 110.3551 },
        error: "GPS tidak tersedia, memakai lokasi contoh.",
        locating: false,
      });
      return;
    }
    set({ locating: true, error: null });
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        set({
          coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          locating: false,
          error: null,
        }),
      () =>
        set({
          coords: { lat: -7.7156, lng: 110.3551 },
          locating: false,
          error: "Izin lokasi ditolak, memakai lokasi contoh (Sleman, DIY).",
        }),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  },
}));

export interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastState {
  toasts: Toast[];
  push: (message: string, type?: Toast["type"]) => void;
  remove: (id: number) => void;
}

let toastId = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (message, type = "success") => {
    const id = ++toastId;
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(
      () => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      4000
    );
  },
  remove: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
