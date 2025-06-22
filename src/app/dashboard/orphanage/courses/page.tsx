'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, BookOpen, Clock, Users, GraduationCap } from 'lucide-react';
import Link from 'next/link';

type Course = {
  id: string;
  title: string;
  provider: string;
  description: string;
  duration: string;
  level: string;
  url: string;
  category: string;
  image: string;
};

const courses: Course[] = [
  {
    id: '1',
    title: 'Introduction to Computer Science',
    provider: 'edX',
    description: 'Learn the basics of computer science and programming with this introductory course from Harvard University.',
    duration: '12 weeks',
    level: 'Beginner',
    url: 'https://www.edx.org/course/introduction-computer-science-harvardx-cs50x',
    category: 'Computer Science',
    image: '/images/cs50.jpg'
  },
  {
    id: '2',
    title: 'Mathematics for Beginners',
    provider: 'Khan Academy',
    description: 'Master the fundamentals of mathematics with interactive exercises and videos.',
    duration: '8 weeks',
    level: 'Beginner',
    url: 'https://www.khanacademy.org/math',
    category: 'Mathematics',
    image: '/images/math.jpg'
  },
  {
    id: '3',
    title: 'English Language Learning',
    provider: 'British Council',
    description: 'Improve your English language skills with free online courses designed for non-native speakers.',
    duration: '10 weeks',
    level: 'All Levels',
    url: 'https://learnenglish.britishcouncil.org/',
    category: 'Language',
    image: '/images/english.jpg'
  },
  {
    id: '4',
    title: 'Art & Creativity',
    provider: 'Google Arts & Culture',
    description: 'Explore art and culture through interactive experiences and creative lessons.',
    duration: '6 weeks',
    level: 'All Levels',
    url: 'https://artsandculture.google.com/',
    category: 'Arts',
    image: '/images/art.jpg'
  },
];

export default function CoursesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Free Courses for Children</h1>
        <p className="text-muted-foreground">
          Discover free educational resources to support the learning and development of children in your care.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id} className="flex flex-col h-full">
            <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-t-lg overflow-hidden">
              <div 
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${course.image})` }}
              />
            </div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{course.category}</span>
                <span className="text-sm font-medium px-2 py-1 bg-primary/10 text-primary rounded-md">
                  {course.level}
                </span>
              </div>
              <CardTitle className="text-xl">{course.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {course.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {course.duration}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {course.provider}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={course.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Course
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
