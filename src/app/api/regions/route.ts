import { db } from "@/db";
import { regions } from "@/db/schema";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db
    .select()
    .from(regions)
    .orderBy(asc(regions.regionName));
  return Response.json(rows);
}
