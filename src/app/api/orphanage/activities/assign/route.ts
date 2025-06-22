import { db } from "@/db"
import { activities } from "@/db/schema"
import { NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { volunteerId, activity, date, time, notes } = await req.json()

    // Prepare the activity data
    const activityData = {
      volunteerId,
      name: activity,
      date,
      timeSlot: time,
      notes: notes || null,
      status: "scheduled" as const,
      createdBy: userId,
    }

    // Create a new activity assignment
    const [newActivity] = await db.insert(activities)
      .values(activityData)
      .returning()

    return NextResponse.json(newActivity)
  } catch (error) {
    console.error("Error assigning activity:", error)
    return NextResponse.json(
      { error: "Failed to assign activity" },
      { status: 500 }
    )
  }
}
