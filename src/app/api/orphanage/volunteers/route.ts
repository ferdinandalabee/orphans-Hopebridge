import { db } from "@/db"
import { volunteerProfiles, users } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch all volunteers with their availability
    const volunteers = await db
      .select({
        id: volunteerProfiles.id,
        firstName: volunteerProfiles.firstName,
        lastName: volunteerProfiles.lastName,
        skills: volunteerProfiles.skills,
        availability: volunteerProfiles.availability,
        phoneNumber: volunteerProfiles.phoneNumber,
        email: users.email,
        profileImage: users.profileImageUrl,
        bio: volunteerProfiles.about,
        location: volunteerProfiles.city,
        lastActive: volunteerProfiles.updatedAt
      })
      .from(volunteerProfiles)
      .leftJoin(users, eq(volunteerProfiles.userId, users.id))
      .where(eq(volunteerProfiles.profileComplete, true))

    return NextResponse.json(volunteers)
  } catch (error) {
    console.error("Error fetching volunteers:", error)
    return NextResponse.json(
      { error: "Failed to fetch volunteers" },
      { status: 500 }
    )
  }
}
