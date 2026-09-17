import { db } from "@/db";
import { notifications } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const userId = Number(req.nextUrl.searchParams.get("userId"));
  if (!Number.isInteger(userId)) {
    return Response.json({ error: "userId wajib diisi" }, { status: 400 });
  }
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(100);
  return Response.json(rows);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const userId = Number(body?.userId);
  if (!Number.isInteger(userId)) {
    return Response.json({ error: "userId wajib diisi" }, { status: 400 });
  }
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(eq(notifications.userId, userId), eq(notifications.isRead, false))
    );
  return Response.json({ ok: true });
}
