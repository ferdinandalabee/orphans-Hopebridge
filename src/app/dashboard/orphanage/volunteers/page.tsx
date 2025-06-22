import { VolunteerList } from "@/components/volunteer/volunteer-list"

export const metadata = {
  title: "Volunteers | Orphanage Dashboard",
  description: "Manage volunteers and assign activities",
}

export default function VolunteersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Volunteer Management</h2>
        <p className="text-muted-foreground">
          View and manage volunteers for your orphanage
        </p>
      </div>
      <VolunteerList />
    </div>
  )
}
