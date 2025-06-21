'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, CheckCircle } from 'lucide-react';

export function AccountSettings() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.emailAddresses?.[0]?.emailAddress || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      await user.update({
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await user.updatePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      toast.success('Password updated successfully!');

      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password. Please check your current password and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'security'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Security
          </button>
        </nav>
      </div>

      {activeTab === 'profile' ? (
        <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-2xl">
          <div>
            <h3 className="text-lg font-medium">Profile Information</h3>
            <p className="text-sm text-muted-foreground">
              Update your account's profile information and email address.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">First Name</label>
              <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Last Name</label>
              <Input
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="bg-gray-100"
              />
              <p className="text-xs text-muted-foreground">
                Contact support to change your email address.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-2xl">
          <div>
            <h3 className="text-lg font-medium">Update Password</h3>
            <p className="text-sm text-muted-foreground">
              Ensure your account is using a long, random password to stay secure.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Password</label>
              <Input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder="Enter your current password"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <Input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder="Enter new password"
                required
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters long.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm New Password</label>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder="Confirm new password"
                required
              />
            </div>
          </div>

          {/* You may conditionally render this success message based on real state */}
          {/* <div className="flex items-center text-sm text-green-600">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span>Your password has been changed successfully.</span>
          </div> */}

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
