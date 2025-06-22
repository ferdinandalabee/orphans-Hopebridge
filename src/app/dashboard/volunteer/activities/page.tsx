import { db } from "@/db"
import { activities, volunteerProfiles, users, orphanages } from "@/db/schema"
import { eq, and, desc } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { Calendar, Clock, Home, CheckCircle2, XCircle } from "lucide-react"

export default async function VolunteerActivitiesPage() {
  const { userId } = await auth()
  
  if (!userId) {
    return <div className="p-8 text-center">Please sign in to view your activities</div>
  }

  // Get the volunteer's profile using their Clerk userId
  const volunteer = await db.query.volunteerProfiles.findFirst({
    where: eq(volunteerProfiles.userId, userId),
    columns: {
      id: true,
      firstName: true,
      lastName: true,
    },
  })

  if (!volunteer) {
    return (
      <div className="p-8 text-center">
        <p>Volunteer profile not found. Please complete your profile first.</p>
        <a 
          href="/dashboard/volunteer/profile" 
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Complete Profile
        </a>
      </div>
    )
  }

  // Fetch activities assigned to this volunteer
  const assignedActivities = await db
    .select({
      id: activities.id,
      name: activities.name,
      date: activities.date,
      timeSlot: activities.timeSlot,
      status: activities.status,
      notes: activities.notes,
      orphanageName: orphanages.name,
      orphanageLocation: orphanages.city,
      createdAt: activities.createdAt,
    })
    .from(activities)
    .leftJoin(orphanages, eq(activities.createdBy, orphanages.userId))
    .where(
      and(
        eq(activities.volunteerId, volunteer.id),
        eq(activities.status, 'scheduled')
      )
    )
    .orderBy(desc(activities.date), desc(activities.timeSlot))

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Scheduled
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Completed
          </span>
        )
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="mr-1 h-3 w-3" />
            Cancelled
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        )
    }
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Volunteer Activities</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your scheduled volunteer activities
        </p>
      </div>

      {assignedActivities.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No activities scheduled</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have any upcoming volunteer activities assigned to you yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignedActivities.map((activity) => (
            <Card key={activity.id} className="hover:shadow-md transition-shadow overflow-hidden">
              <div className="md:flex">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{activity.name}</h3>
                      <div className="mt-1">
                        {getStatusBadge(activity.status)}
                      </div>
                    </div>
                    {activity.orphanageName && (
                      <div className="flex items-center text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                        <Home className="mr-1 h-4 w-4" />
                        {activity.orphanageName}
                        {activity.orphanageLocation && (
                          <span className="ml-1 text-xs">• {activity.orphanageLocation}</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      {format(new Date(activity.date), 'EEEE, MMMM d, yyyy')}
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      {activity.timeSlot}
                    </div>
                  </div>

                  {activity.notes && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-medium mb-1">Notes from the orphanage:</h4>
                      <p className="text-sm text-muted-foreground">{activity.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
