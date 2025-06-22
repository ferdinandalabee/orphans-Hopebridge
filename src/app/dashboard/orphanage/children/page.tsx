// src/app/dashboard/orphanage/children/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  photoUrl: string | null;
  bio: string | null;
  isAdopted: boolean;
  needs: string[];
  interests: string[];
}

export default function ChildrenPage() {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const response = await fetch('/api/orphanage/children');
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch children');
        }

        // The API returns { data: childrenList }
        const childrenData = Array.isArray(result?.data) ? result.data : [];
        setChildren(childrenData);
        setError(null);
      } catch (err) {
        console.error('Error fetching children:', err);
        setError(err instanceof Error ? err.message : 'Failed to load children');
        toast.error('Failed to load children. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, []);

  const calculateAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Children</h1>
          <p className="text-muted-foreground">Manage the children in your orphanage</p>
        </div>
        <Button onClick={() => router.push('/dashboard/orphanage/children/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Child
        </Button>
      </div>

      {!children || children.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No children found in your orphanage.</p>
          <Button onClick={() => router.push('/dashboard/orphanage/children/new')}>
            Add Your First Child
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => (
            <Card key={child.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage 
                      src={child.photoUrl || '/placeholder-child.jpg'} 
                      alt={`${child.firstName} ${child.lastName}`}
                    />
                    <AvatarFallback>
                      {child.firstName[0]}{child.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {child.firstName} {child.lastName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {calculateAge(child.dateOfBirth)} years old • {child.gender}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                {child.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {child.bio}
                  </p>
                )}
                {child.needs && child.needs.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-sm font-medium mb-1">Needs:</h4>
                    <div className="flex flex-wrap gap-1">
                      {child.needs.slice(0, 3).map((need, i) => (
                        <span 
                          key={i} 
                          className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full"
                        >
                          {need}
                        </span>
                      ))}
                      {child.needs.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{child.needs.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => router.push(`/dashboard/orphanage/children/${child.id}`)}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}