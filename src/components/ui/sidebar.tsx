'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Users, UserPlus, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/db/utils';
import { SignOutButton } from '@clerk/nextjs';

const navItems = [
  { name: 'Dashboard', href: '/dashboard/orphanage', icon: Home },
  { name: 'Children', href: '/dashboard/orphanage/children', icon: Users },
  { name: 'Add Child', href: '/dashboard/orphanage/children/new', icon: UserPlus },
  { name: 'Settings', href: '/dashboard/orphanage/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-bold text-gray-900">HopeBridge</h1>
          </div>
          <div className="mt-5 flex-1 flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      'group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors'
                    )}
                  >
                    <Icon
                      className={cn(
                        isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500',
                        'mr-3 flex-shrink-0 h-6 w-6'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="px-4 py-4 border-t border-gray-200">
            <SignOutButton redirectUrl="/">
              <Button variant="ghost" className="w-full justify-start">
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
