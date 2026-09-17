import { db } from "@/db";
import { notifications, pests, regions, reports, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");
  const limit = Math.min(
    Number(req.nextUrl.searchParams.get("limit") ?? 200),
    500
  );

  const base = db
    .select({
      id: reports.id,
      latitude: reports.latitude,
      longitude: reports.longitude,
      photoUrl: reports.photoUrl,
      additionalNote: reports.additionalNote,
      status: reports.status,
      createdAt: reports.createdAt,
      pestId: reports.pestId,
      pestName: pests.pestName,
      severityLevel: pests.severityLevel,
      reporterName: users.name,
      regionName: regions.regionName,
    })
    .from(reports)
    .innerJoin(pests, eq(reports.pestId, pests.id))
    .innerJoin(users, eq(reports.userId, users.id))
    .leftJoin(regions, eq(users.regionId, regions.id));

  const rows =
    status === "PENDING" || status === "VERIFIED" || status === "REJECTED"
      ? await base
          .where(eq(reports.status, status))
          .orderBy(desc(reports.createdAt))
          .limit(limit)
      : await base.orderBy(desc(reports.createdAt)).limit(limit);

  return Response.json(rows);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, pestId, latitude, longitude, photoUrl, additionalNote } =
      body ?? {};

    if (!userId || !pestId || latitude == null || longitude == null) {
      return Response.json(
        { error: "Data laporan belum lengkap." },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(reports)
      .values({
        userId: Number(userId),
        pestId: Number(pestId),
        latitude: Number(latitude),
        longitude: Number(longitude),
        photoUrl: typeof photoUrl === "string" ? photoUrl : null,
        additionalNote:
          typeof additionalNote === "string" && additionalNote.trim()
            ? additionalNote.trim()
            : null,
      })
      .returning();

    // Beritahu semua petugas & admin bahwa ada laporan baru masuk antrean.
    const [pest] = await db
      .select({ pestName: pests.pestName })
      .from(pests)
      .where(eq(pests.id, Number(pestId)));
    const officers = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role, "OFFICER"));
    const admins = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role, "ADMIN"));
    const targets = [...officers, ...admins];
    if (targets.length > 0) {
      await db.insert(notifications).values(
        targets.map((t) => ({
          userId: t.id,
          message: `Laporan baru #${created.id} (${pest?.pestName ?? "hama"}) menunggu verifikasi.`,
        }))
      );
    }

    return Response.json(created, { status: 201 });
  } catch {
    return Response.json(
      { error: "Gagal menyimpan laporan. Coba lagi." },
      { status: 500 }
    );
  }
}
