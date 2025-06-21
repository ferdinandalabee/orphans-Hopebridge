import { ReactNode } from 'react';
import { Sidebar } from '@/components/ui/sidebar';
import { UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { eq } from 'drizzle-orm';
import { orphanages } from '@/db/schema';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  // Check if user has an orphanage
  const userOrphanage = await db
    .select()
    .from(orphanages)
    .where(eq(orphanages.userId, userId))
    .then(rows => rows[0]);
  
  // Get current path to prevent redirect loops
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const isRegistrationPage = currentPath.includes('/register');
  const isOrphanagePage = currentPath === '/dashboard/orphanage';
  
  if (!userOrphanage && !isRegistrationPage) {
    // Redirect to registration if no orphanage and not already on registration page
    redirect('/dashboard/orphanage/register');
  } else if (userOrphanage && (isRegistrationPage || currentPath === '/dashboard')) {
    // Redirect to orphanage dashboard if user has orphanage and is on registration page or root dashboard
    redirect('/dashboard/orphanage');
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="flex justify-between items-center px-6 py-4">
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
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
