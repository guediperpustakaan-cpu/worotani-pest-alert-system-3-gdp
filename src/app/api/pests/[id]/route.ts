import { db } from "@/db";
import { pests } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const pestId = Number(id);
  if (!Number.isInteger(pestId)) {
    return Response.json({ error: "ID tidak valid" }, { status: 400 });
  }
  const [row] = await db.select().from(pests).where(eq(pests.id, pestId));
  if (!row) {
    return Response.json({ error: "Hama tidak ditemukan" }, { status: 404 });
  }
  return Response.json(row);
}
