import { db } from "@/db";
import { pests } from "@/db/schema";
import { asc, ilike, or } from "drizzle-orm";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const base = db.select().from(pests);
  const rows = q
    ? await base
        .where(
          or(ilike(pests.pestName, `%${q}%`), ilike(pests.symptoms, `%${q}%`))
        )
        .orderBy(asc(pests.pestName))
    : await base.orderBy(asc(pests.pestName));
  return Response.json(rows);
}
