import { db } from "@/db";
import { notifications, regions, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const regionId = Number(body?.regionId);
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!message) {
    return Response.json(
      { error: "Pesan siaran tidak boleh kosong." },
      { status: 400 }
    );
  }

  let targets: { id: number }[];
  let regionName = "Semua Wilayah";

  if (Number.isInteger(regionId) && regionId > 0) {
    targets = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.regionId, regionId));
    const [r] = await db
      .select({ name: regions.regionName })
      .from(regions)
      .where(eq(regions.id, regionId));
    regionName = r?.name ?? regionName;
  } else {
    targets = await db.select({ id: users.id }).from(users);
  }

  if (targets.length === 0) {
    return Response.json(
      { error: "Tidak ada pengguna di wilayah tersebut." },
      { status: 400 }
    );
  }

  await db.insert(notifications).values(
    targets.map((t) => ({
      userId: t.id,
      message: `📢 SIARAN PETUGAS [${regionName}]: ${message}`,
    }))
  );

  return Response.json({ ok: true, sentTo: targets.length, regionName });
}
