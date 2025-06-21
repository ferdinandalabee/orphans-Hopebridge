import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { Sidebar } from '@/components/volunteer/sidebar';

export default function VolunteerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </ClerkProvider>
  );
}
