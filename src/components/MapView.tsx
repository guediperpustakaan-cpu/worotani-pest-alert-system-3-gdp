"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from "react-leaflet";
import Link from "next/link";
import { timeAgo } from "@/lib/geo";
import {
  severityColor,
  severityLabel,
  statusLabel,
  type ReportItem,
  type Severity,
} from "@/lib/types";

function pinIcon(severity: Severity) {
  return L.divIcon({
    className: "",
    html: `<span class="marker-pin" style="background:${severityColor[severity]}"></span>`,
    iconSize: [26, 26],
    iconAnchor: [6, 24],
    popupAnchor: [7, -22],
  });
}

const userIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:16px;height:16px;border-radius:50%;background:#2563eb;border:3px solid white;box-shadow:0 0 0 4px rgba(37,99,235,0.3)"></span>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

interface HeatPoint {
  latitude: number;
  longitude: number;
  severity: Severity;
}

export default function MapView({
  reports = [],
  userLocation,
  center = { lat: -7.7456, lng: 110.3695 },
  zoom = 12,
  heatPoints,
  className = "h-full",
}: {
  reports?: ReportItem[];
  userLocation?: { lat: number; lng: number } | null;
  center?: { lat: number; lng: number };
  zoom?: number;
  heatPoints?: HeatPoint[];
  className?: string;
}) {
  return (
    <div className={className}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        scrollWheelZoom
        className="rounded-none"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {heatPoints?.map((p, i) => (
          <Circle
            key={`h-${i}`}
            center={[p.latitude, p.longitude]}
            radius={p.severity === "HIGH" ? 1400 : p.severity === "MEDIUM" ? 1000 : 700}
            pathOptions={{
              color: "transparent",
              fillColor: severityColor[p.severity],
              fillOpacity: 0.28,
            }}
          />
        ))}

        {reports.map((r) => (
          <Marker
            key={r.id}
            position={[r.latitude, r.longitude]}
            icon={pinIcon(r.severityLevel)}
          >
            <Popup>
              <div className="min-w-44 space-y-1.5">
                {r.photoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.photoUrl}
                    alt={r.pestName}
                    className="h-24 w-full rounded-md object-cover"
                  />
                )}
                <p className="text-sm font-bold text-slate-900">{r.pestName}</p>
                <p className="text-xs">
                  <span
                    className="rounded-full px-2 py-0.5 font-semibold text-white"
                    style={{ background: severityColor[r.severityLevel] }}
                  >
                    {severityLabel[r.severityLevel]}
                  </span>{" "}
                  <span className="text-slate-500">{statusLabel[r.status]}</span>
                </p>
                {r.additionalNote && (
                  <p className="text-xs text-slate-600">{r.additionalNote}</p>
                )}
                <p className="text-[11px] text-slate-500">
                  Oleh {r.reporterName} · {timeAgo(r.createdAt)}
                </p>
                <Link
                  href={`/wiki/${r.pestId}`}
                  className="inline-block text-xs font-bold text-leaf-700 underline"
                >
                  Baca panduan penanganan →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}

        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userIcon}
          >
            <Popup>Lokasi Anda saat ini</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
