"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Phone, Mail, Calendar, Clock, User, Star, CalendarDays, MapPin, Award, Clock as ClockIcon } from "lucide-react"
import { AssignActivityDialog } from "@/components/volunteer/assign-activity-dialog"

export interface Volunteer {
  id: string
  firstName: string
  lastName: string
  skills: string[]
  availability: string[]
  phoneNumber: string
  email: string
  bio: string
  profileImage?: string
  location: string
  lastActive: string
}

export function VolunteerList() {
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)

  const { data: volunteers, isLoading, error } = useQuery<Volunteer[]>({
    queryKey: ["volunteers"],
    queryFn: async () => {
      const res = await fetch("/api/orphanage/volunteers")
      if (!res.ok) throw new Error("Failed to fetch volunteers")
      return res.json()
    }
  })

  const handleAssignActivity = async (data: {
    activity: string
    date: string
    time: string
    notes: string
  }) => {
    if (!selectedVolunteer) return

    try {
      const response = await fetch('/api/orphanage/activities/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          volunteerId: selectedVolunteer.id,
          ...data,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to assign activity')
      }

      return await response.json()
    } catch (error) {
      console.error('Error assigning activity:', error)
      throw error
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error loading volunteers. Please try again.</p>
      </div>
    )
  }

  if (!volunteers?.length) {
    return (
      <div className="text-center py-8">
        <p>No volunteers found.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Volunteers</h3>
            <p className="text-sm text-muted-foreground">
              Manage and schedule activities with volunteers
            </p>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {volunteers.map((volunteer) => (
            <Card key={volunteer.id} className="hover:shadow-md transition-shadow overflow-hidden">
              <div className="relative h-24 bg-gradient-to-r from-blue-50 to-indigo-50" />
              <div className="px-6 -mt-12">
                <Avatar className="h-20 w-20 border-4 border-background">
                  <AvatarImage src={volunteer.profileImage} alt={`${volunteer.firstName} ${volunteer.lastName}`} />
                  <AvatarFallback>
                    <User className="h-10 w-10 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardHeader className="pt-4 pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">
                      {volunteer.firstName} {volunteer.lastName}
                    </CardTitle>
                    {volunteer.location && (
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        {volunteer.location}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    Active
                  </div>
                </div>
                
                {volunteer.skills && volunteer.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {volunteer.skills.slice(0, 3).map((skill, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-secondary/50">
                        {skill}
                      </span>
                    ))}
                    {volunteer.skills.length > 3 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/50">
                        +{volunteer.skills.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="space-y-3">
                {volunteer.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {volunteer.bio}
                  </p>
                )}
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  {volunteer.availability && volunteer.availability.length > 0 && (
                    <div className="flex items-center text-sm">
                      <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">Available:</span>
                      <span className="ml-1 font-medium">
                        {volunteer.availability.join(', ')}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm">
                    <Award className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground">Skills:</span>
                    <span className="ml-1 font-medium">
                      {volunteer.skills.slice(0, 2).join(', ')}
                      {volunteer.skills.length > 2 ? ` +${volunteer.skills.length - 2}` : ''}
                    </span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="border-t pt-4 pb-4">
                <div className="flex w-full justify-between space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedVolunteer(volunteer)
                      setIsAssignDialogOpen(true)
                    }}
                  >
                    Assign Activity
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      // View profile action
                    }}
                  >
                    View Profile
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {selectedVolunteer && (
          <AssignActivityDialog
            open={isAssignDialogOpen}
            onOpenChange={setIsAssignDialogOpen}
            volunteerName={`${selectedVolunteer.firstName} ${selectedVolunteer.lastName}`}
            volunteerId={selectedVolunteer.id}
            onAssign={handleAssignActivity}
          />
        )}
      </div>
    </>
  )
}
