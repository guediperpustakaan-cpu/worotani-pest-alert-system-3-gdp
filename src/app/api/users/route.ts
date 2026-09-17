import { db } from "@/db";
import { regions, users } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      regionId: users.regionId,
      regionName: regions.regionName,
    })
    .from(users)
    .leftJoin(regions, eq(users.regionId, regions.id))
    .orderBy(asc(users.role), asc(users.name));
  return Response.json(rows);
}
