'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';

export default function VolunteerRegistration() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.emailAddresses?.[0]?.emailAddress || '',
    phone: '',
    skills: '',
    experience: '',
    availability: '',
    motivation: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Here you would typically send this data to your backend
      console.log('Submitting volunteer application:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to dashboard after successful submission
      router.push('/dashboard/volunteer');
      toast.success('Volunteer application submitted successfully!');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Become a Volunteer</h1>
          <p className="mt-2 text-lg text-gray-600">
            Join our community and make a difference in the lives of orphaned children
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!!user?.emailAddresses?.[0]?.emailAddress}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="skills">Skills and Expertise</Label>
              <Input
                id="skills"
                name="skills"
                type="text"
                placeholder="e.g., Teaching, Counseling, Sports, Music"
                value={formData.skills}
                onChange={handleInputChange}
              />
              <p className="mt-1 text-sm text-gray-500">
                What skills or expertise can you offer?
              </p>
            </div>

            <div>
              <Label>Previous Volunteer Experience</Label>
              <Textarea
                id="experience"
                name="experience"
                rows={3}
                placeholder="Describe any previous volunteer experience you have..."
                value={formData.experience}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label>Availability</Label>
              <Select
                value={formData.availability}
                onValueChange={(value) => handleSelectChange('availability', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekdays">Weekdays</SelectItem>
                  <SelectItem value="weekends">Weekends</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                  <SelectItem value="occasional">Occasional/Events</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Why do you want to volunteer with us?</Label>
              <Textarea
                id="motivation"
                name="motivation"
                rows={4}
                placeholder="Tell us what motivates you to volunteer..."
                value={formData.motivation}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </form>

          {!isSignedIn && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => router.push('/sign-in')}
                >
                  Sign in
                </Button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
