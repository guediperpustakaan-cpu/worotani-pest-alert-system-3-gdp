import { db } from "@/db";
import { pests, reports, users } from "@/db/schema";
import { and, count, eq, gte } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [verified] = await db
    .select({ value: count() })
    .from(reports)
    .where(eq(reports.status, "VERIFIED"));
  const [activeOutbreaks] = await db
    .select({ value: count() })
    .from(reports)
    .where(
      and(eq(reports.status, "VERIFIED"), gte(reports.createdAt, thirtyDaysAgo))
    );
  const [farmers] = await db.select({ value: count() }).from(users);
  const [pestCount] = await db.select({ value: count() }).from(pests);
  const [pending] = await db
    .select({ value: count() })
    .from(reports)
    .where(eq(reports.status, "PENDING"));

  return Response.json({
    verifiedReports: verified?.value ?? 0,
    activeOutbreaks: activeOutbreaks?.value ?? 0,
    activeUsers: farmers?.value ?? 0,
    pestTypes: pestCount?.value ?? 0,
    pendingReports: pending?.value ?? 0,
    serverTime: new Date().toISOString(),
  });
}
