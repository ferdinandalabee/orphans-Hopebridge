'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Users, Heart, Gift, Activity, UserPlus, Settings, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

type StatCardProps = {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend: string;
};

function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <p className="text-xs text-green-600 mt-2">{trend}</p>
        </div>
        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </Card>
  );
}

interface Orphanage {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  description: string;
  capacity: number;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bio?: string;
  needs?: string[];
  interests?: string[];
  photoUrl?: string;
  isAdopted: boolean;
  createdAt: string;
  updatedAt: string;
  orphanageId: string;
}

interface DashboardStats {
  totalChildren: number;
  availableForAdoption: number;
  adopted: number;
  recentActivity: number;
}

export default function OrphanageDashboard() {
  const router = useRouter();
  const [orphanage, setOrphanage] = useState<Orphanage | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [stats, setStats] = useState<DashboardStats>({
    totalChildren: 0,
    availableForAdoption: 0,
    adopted: 0,
    recentActivity: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [orphanageRes, childrenRes] = await Promise.all([
          fetch('/api/orphanage'),
          fetch('/api/orphanage/children')
        ]);

        if (orphanageRes.status === 404) {
          // No orphanage found, but don't throw error - let the UI handle it
          console.log('No orphanage found for current user');
          return;
        }

        if (!orphanageRes.ok) {
          throw new Error('Failed to fetch orphanage data');
        }

        if (!childrenRes.ok) {
          throw new Error('Failed to fetch children data');
        }

        const [orphanageData, childrenData] = await Promise.all([
          orphanageRes.json(),
          childrenRes.json()
        ]);

        console.log('Orphanage data:', orphanageData);
        console.log('Children data:', childrenData);

        if (orphanageData && !orphanageData.error) {
          setOrphanage(orphanageData);
        }
        
        const childrenList = childrenData.data || childrenData || [];
        setChildren(childrenList);
        
        const availableCount = childrenList.filter((c: Child) => !c.isAdopted).length;
        const adoptedCount = childrenList.filter((c: Child) => c.isAdopted).length;
        
        setStats({
          totalChildren: childrenData.data.length,
          availableForAdoption: availableCount,
          adopted: adoptedCount,
          recentActivity: Math.min(childrenData.data.length, 5)
        });
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
        console.error('Error fetching data:', errorMessage);
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={`stat-${i}`} className="h-32 rounded-lg" />
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-12 rounded-t-lg" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={`child-${i}`} className="h-20" />
            ))}
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <div className="bg-red-50 p-4 rounded-lg max-w-md w-full">
          <h2 className="text-lg font-medium text-red-800 mb-2">Something went wrong</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!orphanage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>No Orphanage Found</CardTitle>
            <p className="text-sm text-muted-foreground">
              You haven't registered an orphanage yet. Please register your orphanage to continue.
            </p>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/orphanage/register">Register Orphanage</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back, {orphanage.name}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Children" value={stats.totalChildren} icon={<Users className="h-6 w-6 text-blue-500" />} trend="+2.5% from last month" />
        <StatCard title="Available for Adoption" value={stats.availableForAdoption} icon={<Heart className="h-6 w-6 text-green-500" />} trend="+5% from last month" />
        <StatCard title="Successfully Adopted" value={stats.adopted} icon={<Gift className="h-6 w-6 text-purple-500" />} trend="+12% from last month" />
        <StatCard title="Recent Activity" value={stats.recentActivity} icon={<Activity className="h-6 w-6 text-yellow-500" />} trend="+8% from last month" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="border-b">
              <div className="flex justify-between items-center">
                <CardTitle>Children Overview</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/orphanage/children">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {children.length > 0 ? (
                <div className="divide-y">
                  {children.slice(0, 5).map((child) => (
                    <div key={child.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{child.firstName} {child.lastName}</p>
                          <p className="text-sm text-gray-500">{new Date().getFullYear() - new Date(child.dateOfBirth).getFullYear()} years old</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          child.isAdopted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {child.isAdopted ? 'Adopted' : 'Available'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">No children registered yet. Add your first child to get started.</div>
              )}
            </CardContent>
            {children.length > 0 && (
              <CardFooter className="border-t">
                <Button variant="ghost" size="sm" className="w-full" asChild>
                  <Link href="/dashboard/orphanage/children/new" className="flex items-center justify-center">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Child
                  </Link>
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Orphanage Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Contact Email</p>
                <p>{orphanage.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p>{orphanage.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Location</p>
                <p>{[orphanage.city, orphanage.state, orphanage.country].filter(Boolean).join(', ')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Capacity</p>
                <p>{orphanage.capacity || 'Not specified'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/orphanage/children/new">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add New Child
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/orphanage/children">
                  <Users className="mr-2 h-4 w-4" />
                  View All Children
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/orphanage/edit">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Edit Orphanage Profile
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
