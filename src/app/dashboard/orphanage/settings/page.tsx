'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings2, Users, UserCog, Lock } from 'lucide-react';
import { OrphanageSettings } from './components/orphanage-settings';
import { ChildrenSettings } from './components/children-settings';
import { AccountSettings } from './components/account-settings';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your orphanage and account settings
        </p>
      </div>

      <Tabs defaultValue="orphanage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orphanage" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            <span>Orphanage</span>
          </TabsTrigger>
          <TabsTrigger value="children" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Children</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            <span>Account</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orphanage">
          <OrphanageSettings />
        </TabsContent>

        <TabsContent value="children">
          <ChildrenSettings />
        </TabsContent>

        <TabsContent value="account">
          <AccountSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
