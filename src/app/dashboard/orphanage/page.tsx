'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Heart, Gift, Activity, PlusCircle, UserPlus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
};

function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {trend && <p className="text-xs text-green-600 mt-2">{trend}</p>}
        </div>
        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </Card>
  );
}

interface OrphanageData {
  name: string;
  totalChildren: number;
  availableForAdoption: number;
  adoptedThisMonth: number;
  activeVolunteers: number;
}

export default function OrphanageDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [orphanageData, setOrphanageData] = useState<OrphanageData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/orphanage/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        setOrphanageData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!orphanageData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  const stats = [
    { 
      title: 'Total Children', 
      value: orphanageData.totalChildren, 
      icon: <Users className="h-6 w-6 text-blue-600" />, 
      trend: '+0% from last month' 
    },
    { 
      title: 'Available for Adoption', 
      value: orphanageData.availableForAdoption, 
      icon: <Heart className="h-6 w-6 text-green-600" />, 
      trend: '+0% from last month' 
    },
    { 
      title: 'Adopted This Month', 
      value: orphanageData.adoptedThisMonth, 
      icon: <Gift className="h-6 w-6 text-purple-600" />, 
      trend: '+0% from last month' 
    },
    { 
      title: 'Active Volunteers', 
      value: orphanageData.activeVolunteers, 
      icon: <Activity className="h-6 w-6 text-yellow-600" />, 
      trend: '+0% from last month' 
    },
  ];

  const quickActions = [
    { title: 'Add New Child', icon: <PlusCircle className="mr-2 h-4 w-4" />, onClick: () => router.push('/dashboard/children/new') },
    { title: 'View All Children', icon: <Users className="mr-2 h-4 w-4" />, onClick: () => router.push('/dashboard/children') },
    { title: 'Manage Volunteers', icon: <UserPlus className="mr-2 h-4 w-4" />, onClick: () => router.push('/dashboard/volunteers') },
  ];

  return (
    <div className="container space-y-8 py-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {orphanageData.name}</p>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <StatCard 
            key={i}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="p-4 border rounded-lg">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <PlusCircle className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="font-medium">New child registered</p>
                      <p className="text-sm text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quickActions.map((action, i) => (
                <Button 
                  key={i} 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={action.onClick}
                >
                  {action.icon}
                  {action.title}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
