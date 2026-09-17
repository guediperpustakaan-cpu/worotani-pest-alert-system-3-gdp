import { db } from "@/db";
import { notifications, pests, regions, reports, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { severityLabel } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const reportId = Number(id);
  if (!Number.isInteger(reportId)) {
    return Response.json({ error: "ID tidak valid" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const status = body?.status as "VERIFIED" | "REJECTED" | undefined;
  if (status !== "VERIFIED" && status !== "REJECTED") {
    return Response.json({ error: "Status tidak valid" }, { status: 400 });
  }

  const [updated] = await db
    .update(reports)
    .set({ status })
    .where(eq(reports.id, reportId))
    .returning();

  if (!updated) {
    return Response.json({ error: "Laporan tidak ditemukan" }, { status: 404 });
  }

  const [detail] = await db
    .select({
      pestName: pests.pestName,
      severity: pests.severityLevel,
      reporterId: users.id,
      reporterRegion: regions.regionName,
      reporterRegionId: users.regionId,
    })
    .from(reports)
    .innerJoin(pests, eq(reports.pestId, pests.id))
    .innerJoin(users, eq(reports.userId, users.id))
    .leftJoin(regions, eq(users.regionId, regions.id))
    .where(eq(reports.id, reportId));

  if (detail) {
    if (status === "VERIFIED") {
      // Beritahu pelapor
      await db.insert(notifications).values({
        userId: detail.reporterId,
        message: `Laporan Anda #${reportId} (${detail.pestName}) telah DIVERIFIKASI. Terima kasih sudah saling menjaga!`,
      });
      // Peringatkan petani lain di wilayah sekitar
      const nearbyFarmers = detail.reporterRegionId
        ? await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.regionId, detail.reporterRegionId))
        : await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.role, "FARMER"));
      const targets = nearbyFarmers.filter(
        (f) => f.id !== detail.reporterId
      );
      if (targets.length > 0) {
        await db.insert(notifications).values(
          targets.map((f) => ({
            userId: f.id,
            message: `⚠️ WASPADA: Serangan ${detail.pestName} (tingkat ${severityLabel[detail.severity]}) terkonfirmasi di ${detail.reporterRegion ?? "wilayah sekitar Anda"}. Segera cek lahan & baca panduan penanganan di Wiki Hama.`,
          }))
        );
      }
    } else {
      await db.insert(notifications).values({
        userId: detail.reporterId,
        message: `Laporan Anda #${reportId} (${detail.pestName}) ditolak petugas. Pastikan foto & lokasi jelas, lalu laporkan kembali.`,
      });
    }
  }

  return Response.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const reportId = Number(id);
  if (!Number.isInteger(reportId)) {
    return Response.json({ error: "ID tidak valid" }, { status: 400 });
  }
  await db.delete(reports).where(eq(reports.id, reportId));
  return Response.json({ ok: true, removed: reportId });
}
