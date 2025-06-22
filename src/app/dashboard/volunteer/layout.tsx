import { ReactNode } from 'react';
import { VolunteerSidebar } from '@/components/ui/volunteer-sidebar';
import { UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { volunteerProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function VolunteerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  // Check if user is a volunteer
  const volunteer = await db.query.volunteerProfiles.findFirst({
    where: eq(volunteerProfiles.userId, userId),
  });

  // If not a volunteer, redirect to the appropriate dashboard
  if (!volunteer) {
    redirect('/dashboard/orphanage');
  }

  return (
    <div className="flex min-h-screen bg-background">
      <VolunteerSidebar />
      <div className="flex-1 flex flex-col">
        <header className="border-b">
          <div className="container flex h-16 items-center px-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold">Volunteer Dashboard</h1>
            </div>
            <div className="ml-auto flex items-center space-x-4">
              <UserButton afterSignOutUrl='/' />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
