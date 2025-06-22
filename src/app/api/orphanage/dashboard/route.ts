import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { eq, and, gte, sql } from "drizzle-orm";
import { orphanages, children, volunteerProfiles } from "@/db/schema";

export async function GET(req: Request) {
  try {
    console.log("Received request to /api/orphanage/dashboard");
    
    let userId;
    try {
      const auth = getAuth(req);
      userId = auth.userId;
      console.log("Authenticated user ID:", userId);
    } catch (authError) {
      console.error("Authentication error:", authError);
      return new NextResponse(
        JSON.stringify({ error: "Authentication failed", details: authError }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!userId) {
      console.log("No user ID found in session");
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized - No user ID found" }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the orphanage for the current user
    const orphanage = await db.query.orphanages.findFirst({
      where: eq(orphanages.userId, userId),
    });

    if (!orphanage) {
      return new NextResponse("Orphanage not found", { status: 404 });
    }

    // Get total number of children
    const totalChildren = await db
      .select({ count: sql<number>`count(*)` })
      .from(children)
      .where(eq(children.orphanageId, orphanage.id));

    // Get number of children available for adoption
    const availableForAdoption = await db
      .select({ count: sql<number>`count(*)` })
      .from(children)
      .where(
        and(
          eq(children.orphanageId, orphanage.id),
          eq(children.isAdopted, false)
        )
      );

    // Get number of children adopted this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const adoptedThisMonth = await db
      .select({ count: sql<number>`count(*)` })
      .from(children)
      .where(
        and(
          eq(children.orphanageId, orphanage.id),
          eq(children.isAdopted, true),
          gte(children.updatedAt, startOfMonth)
        )
      );

    // Get number of volunteers (since we don't have a status field, we'll count all volunteers)
    const activeVolunteers = await db
      .select({ count: sql<number>`count(*)` })
      .from(volunteerProfiles);
      // Note: We're counting all volunteers since we don't have an orphanageId or status field
      // In a real app, you'd want to add these fields to the schema

    return NextResponse.json({
      name: orphanage.name,
      totalChildren: totalChildren[0]?.count || 0,
      availableForAdoption: availableForAdoption[0]?.count || 0,
      adoptedThisMonth: adoptedThisMonth[0]?.count || 0,
      activeVolunteers: activeVolunteers[0]?.count || 0,
    });
  } catch (error) {
    console.error('[DASHBOARD_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
