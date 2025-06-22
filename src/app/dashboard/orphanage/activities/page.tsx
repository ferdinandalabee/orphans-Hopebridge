import { db } from "@/db"
import { activities, volunteerProfiles } from "@/db/schema"
import { eq, and, desc } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { Calendar, Clock, User, XCircle, CheckCircle2 } from "lucide-react"
import { cancelActivity } from "@/app/actions/activities"

export default async function ActivitiesPage() {
  const { userId } = await auth()
  
  if (!userId) {
    return <div>Unauthorized</div>
  }

  // Fetch activities with volunteer information
  const activitiesList = await db
    .select({
      id: activities.id,
      name: activities.name,
      date: activities.date,
      timeSlot: activities.timeSlot,
      status: activities.status,
      volunteerName: volunteerProfiles.firstName,
      volunteerId: activities.volunteerId,
      notes: activities.notes,
    })
    .from(activities)
    .leftJoin(
      volunteerProfiles,
      eq(activities.volunteerId, volunteerProfiles.id)
    )
    .where(eq(activities.createdBy, userId))
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
        return null
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Scheduled Activities</h1>
      </div>

      {activitiesList.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No activities scheduled yet.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {activitiesList.map((activity) => (
            <Card key={activity.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      {activity.name}
                      {getStatusBadge(activity.status)}
                    </CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <User className="h-4 w-4 mr-1" />
                      {activity.volunteerName || 'Volunteer'}
                    </div>
                  </div>
                  {activity.status === 'scheduled' && (
                    <form action={cancelActivity.bind(null, activity.id)}>
                      <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </form>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p>{format(new Date(activity.date), 'PPP')}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-muted-foreground mr-2" />
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p>{activity.timeSlot}</p>
                    </div>
                  </div>
                </div>
                {activity.notes && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm">{activity.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
