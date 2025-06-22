"use server"

import { db } from "@/db"
import { activities } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

export async function cancelActivity(activityId: string) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      throw new Error("Unauthorized")
    }

    // Verify the activity belongs to the current user
    const activity = await db.query.activities.findFirst({
      where: and(
        eq(activities.id, Number(activityId)),
        eq(activities.createdBy, userId)
      )
    })

    if (!activity) {
      throw new Error("Activity not found or you don't have permission to cancel it")
    }

    // Update the activity status to cancelled
    await db
      .update(activities)
      .set({ 
        status: 'cancelled',
        updatedAt: new Date() 
      })
      .where(eq(activities.id, Number(activityId)))

    // Revalidate the activities page to show the updated status
    revalidatePath('/dashboard/orphanage/activities')
    
    return { success: true }
  } catch (error) {
    console.error("Error cancelling activity:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to cancel activity' 
    }
  }
}
