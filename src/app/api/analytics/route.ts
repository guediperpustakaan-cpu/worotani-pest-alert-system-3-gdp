import { db } from "@/db";
import { pests, reports } from "@/db/schema";
import { count, desc, eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const byPest = await db
    .select({
      pestName: pests.pestName,
      severity: pests.severityLevel,
      total: count(),
    })
    .from(reports)
    .innerJoin(pests, eq(reports.pestId, pests.id))
    .groupBy(pests.pestName, pests.severityLevel)
    .orderBy(desc(count()));

  const monthExpr = sql<string>`to_char(${reports.createdAt}, 'YYYY-MM')`;
  const byMonth = await db
    .select({ month: monthExpr, total: count() })
    .from(reports)
    .groupBy(monthExpr)
    .orderBy(monthExpr);

  const byStatus = await db
    .select({ status: reports.status, total: count() })
    .from(reports)
    .groupBy(reports.status);

  const heatPoints = await db
    .select({
      latitude: reports.latitude,
      longitude: reports.longitude,
      severity: pests.severityLevel,
    })
    .from(reports)
    .innerJoin(pests, eq(reports.pestId, pests.id))
    .where(eq(reports.status, "VERIFIED"));

  return Response.json({ byPest, byMonth, byStatus, heatPoints });
}
