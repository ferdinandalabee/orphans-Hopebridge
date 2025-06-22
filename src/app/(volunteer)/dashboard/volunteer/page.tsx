'use client';

import { useState, useEffect } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Calendar, Users, MessageSquare, HeartHandshake, User, Search, Filter, Heart, MapPin, Gift, BookOpen, Home } from 'lucide-react';
import { VolunteerProfileForm } from '@/components/volunteer-profile-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { db } from '@/db';
import { children, orphanages } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | Date;
  gender: string;
  photoUrl?: string | null;
  bio?: string | null;
  needs?: string[] | null;
  interests?: string[] | null;
  isAdopted: boolean;
  orphanage: {
    id: string;
    name: string;
    city: string;
    state: string;
    photoUrl?: string | null;
  };
}

export default function VolunteerDashboard() {
  const { user, isLoaded } = useUser();
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [childrenData, setChildrenData] = useState<Child[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const response = await fetch('/api/volunteer-profile');
        const data = await response.json();
        setProfileComplete(!!data.profile?.profileComplete);
      } catch (error) {
        console.error('Error checking profile status:', error);
        setProfileComplete(false);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchChildren = async () => {
      try {
        const response = await fetch('/api/children');
        if (!response.ok) {
          throw new Error('Failed to fetch children');
        }
        const data = await response.json();
        setChildrenData(data);
      } catch (error) {
        console.error('Error fetching children:', error);
        // Consider adding error state handling here
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoaded) {
      checkProfile();
      fetchChildren();
    }
  }, [isLoaded]);

  // Filter children based on search term and active tab
  const filteredChildren = childrenData.filter((child) => {
    const matchesSearch = searchTerm === '' || 
      child.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.orphanage.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === 'needs') return matchesSearch && child.needs && child.needs.length > 0;
    if (activeTab === 'recent') {
      // Show children added in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const childDate = new Date(child.dateOfBirth);
      return matchesSearch && childDate >= thirtyDaysAgo;
    }
    return matchesSearch && !child.isAdopted;
  });

  // Define the type for the orphanage with children
  interface OrphanageWithChildren {
    id: string;
    name: string;
    city: string;
    state: string;
    photoUrl?: string | null;
    children: Child[];
  }

  // Group children by orphanage
  const childrenByOrphanage = filteredChildren.reduce<Record<string, OrphanageWithChildren>>((acc, child) => {
    const orphanageId = child.orphanage.id;
    if (!acc[orphanageId]) {
      acc[orphanageId] = {
        ...child.orphanage,
        children: []
      };
    }
    acc[orphanageId].children.push(child);
    return acc;
  }, {});

  // Calculate age from date of birth
  const calculateAge = (dob: string | Date) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (!isLoaded || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (profileComplete === false) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Welcome to Orphans Opportunity</h1>
          <div className="flex items-center space-x-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
        <div className="max-w-4xl mx-auto">
          <VolunteerProfileForm onComplete={() => setProfileComplete(true)} />
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.firstName}!</h1>
          <p className="text-muted-foreground">Make a difference in a child's life today</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search children or orphanages..."
              className="pl-10 w-full md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Children</TabsTrigger>
            <TabsTrigger value="needs" className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              Needs Help
            </TabsTrigger>
            <TabsTrigger value="recent">Recently Added</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Children</CardTitle>
                <Users className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{childrenData.length}</div>
                <p className="text-xs text-muted-foreground">Lives impacted through your support</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orphanages</CardTitle>
                <Home className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.keys(childrenByOrphanage).length}
                </div>
                <p className="text-xs text-muted-foreground">Partner organizations</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Urgent Needs</CardTitle>
                <Heart className="h-5 w-5 text-rose-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {childrenData.reduce((acc, child) => acc + (child.needs?.length || 0), 0)}
                </div>
                <p className="text-xs text-muted-foreground">Needs your help</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Your Impact</CardTitle>
                <HeartHandshake className="h-5 w-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">Lives touched</p>
              </CardContent>
            </Card>
          </div>

          {/* Children Grid */}
          <div className="space-y-8">
            {Object.values(childrenByOrphanage).map((orphanage: any) => (
              <div key={orphanage.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{orphanage.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      {orphanage.city}, {orphanage.state}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Orphanage
                  </Button>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {orphanage.children.map((child: Child) => (
                    <Card key={child.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative h-48 bg-muted">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={child.photoUrl || undefined} alt={`${child.firstName} ${child.lastName}`} />
                          <AvatarFallback>{child.firstName[0]}{child.lastName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="absolute bottom-2 right-2 bg-background/80 px-2 py-1 rounded-full text-sm">
                          {calculateAge(child.dateOfBirth)} years old
                        </div>
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl">
                              {child.firstName} {child.lastName}
                            </CardTitle>
                            <CardDescription className="flex items-center">
                              <MapPin className="h-3.5 w-3.5 mr-1" />
                              {orphanage.city}
                            </CardDescription>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Heart className="h-4 w-4" />
                            <span className="sr-only">Add to favorites</span>
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <div className="space-y-3">
                          {child.needs && child.needs.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium mb-1 flex items-center">
                                <Heart className="h-3.5 w-3.5 mr-1.5 text-rose-500" />
                                Needs Support With
                              </h4>
                              <div className="flex flex-wrap gap-1.5">
                                {child.needs?.slice(0, 3).map((need, i) => (
                                  <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                                    {need}
                                  </Badge>
                                ))}
                                {child.needs && child.needs.length > 3 && (
                                  <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800">
                                    +{child.needs.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {child.interests && child.interests.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium mb-1 flex items-center">
                                <Gift className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                                Interests
                              </h4>
                              <div className="flex flex-wrap gap-1.5">
                                {child.interests?.slice(0, 3).map((interest, i) => (
                                  <Badge key={i} variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
                                    {interest}
                                  </Badge>
                                ))}
                                {child.interests && child.interests.length > 3 && (
                                  <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800">
                                    +{child.interests.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-4">
                        <Button className="w-full" size="sm">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Sponsor {child.firstName}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
            
            {Object.keys(childrenByOrphanage).length === 0 && (
              <div className="text-center py-12 space-y-2">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/40" />
                <h3 className="text-lg font-medium">No children found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search' : 'Check back later for new children in need'}
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <Tabs value="needs" className="space-y-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">Children with Urgent Needs</h3>
            <p className="text-sm text-muted-foreground">Coming soon: View children who need immediate support</p>
          </div>
        </Tabs>
        
        <Tabs value="recent" className="space-y-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">Recently Added Children</h3>
            <p className="text-sm text-muted-foreground">Coming soon: View the most recently added children</p>
          </div>
        </Tabs>
      </Tabs>
    </div>
  );
}
