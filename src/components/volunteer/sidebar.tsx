'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, MessageSquare, LogOut } from 'lucide-react';
import { SignOutButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Dashboard', href: '/dashboard/volunteer', icon: Home },
    { name: 'Activities', href: '/dashboard/volunteer/activities', icon: Calendar },
    { name: 'Messages', href: '/dashboard/volunteer/messages', icon: MessageSquare },
  ];

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-2xl font-bold text-blue-600">Volunteer</h1>
          </div>
          <div className="mt-5 flex-1 flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                    }`}
                  >
                    <item.icon 
                      className={`mr-3 flex-shrink-0 h-6 w-6 ${
                        isActive 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                      }`} 
                      aria-hidden="true" 
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="px-2 py-4 border-t border-gray-200 dark:border-gray-700">
            <SignOutButton>
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign out
              </Button>
            </SignOutButton>
          </div>
        </div>
      </div>
    </div>
  );
}
