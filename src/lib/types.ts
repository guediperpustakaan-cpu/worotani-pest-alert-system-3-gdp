export type Severity = "LOW" | "MEDIUM" | "HIGH";
export type ReportStatus = "PENDING" | "VERIFIED" | "REJECTED";
export type UserRole = "FARMER" | "OFFICER" | "ADMIN";

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  regionId: number | null;
  regionName: string | null;
}

export interface PestItem {
  id: number;
  pestName: string;
  description: string;
  symptoms: string;
  treatmentGuide: string;
  imageGuideUrl: string | null;
  severityLevel: Severity;
}

export interface ReportItem {
  id: number;
  latitude: number;
  longitude: number;
  photoUrl: string | null;
  additionalNote: string | null;
  status: ReportStatus;
  createdAt: string;
  pestId: number;
  pestName: string;
  severityLevel: Severity;
  reporterName: string;
  regionName: string | null;
  distanceKm?: number;
}

export interface NotificationItem {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const severityLabel: Record<Severity, string> = {
  LOW: "Ringan",
  MEDIUM: "Sedang",
  HIGH: "Berbahaya",
};

export const severityColor: Record<Severity, string> = {
  LOW: "#16a34a",
  MEDIUM: "#eab308",
  HIGH: "#dc2626",
};

export const statusLabel: Record<ReportStatus, string> = {
  PENDING: "Menunggu Verifikasi",
  VERIFIED: "Terverifikasi",
  REJECTED: "Ditolak",
};
