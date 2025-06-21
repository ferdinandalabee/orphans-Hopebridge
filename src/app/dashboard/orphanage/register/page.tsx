'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().min(2, 'Country is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  description: z.string().min(20, 'Please provide a detailed description'),
  capacity: z.string().min(1, 'Capacity is required'),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  registrationNumber: z.string().min(5, 'Registration number is required'),
});

type FormData = z.infer<typeof formSchema>;

export default function OrphanageRegistration() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user?.emailAddresses[0]?.emailAddress || '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch('/api/orphanage/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to register orphanage');
      }

      toast.success('Orphanage registered successfully!');
      // Redirect to the orphanage dashboard after successful submission
      router.push('/dashboard/orphanage');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit form. Please try again.');
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!user) {
    router.push('/sign-in');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Register Your Orphanage
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Please fill in the details below to register your orphanage on our platform.
          This information will help us verify your organization and connect you with potential supporters.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Orphanage Name *
              </label>
              <Input
                {...register('name')}
                placeholder="Orphanage Name"
                className={`${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email *
              </label>
              <Input
                {...register('email')}
                type="email"
                placeholder="Email"
                className={`${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone Number *
              </label>
              <Input
                {...register('phone')}
                placeholder="Phone Number"
                className={`${errors.phone ? 'border-red-500' : ''}`}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Registration Number *
              </label>
              <Input
                {...register('registrationNumber')}
                placeholder="Registration Number"
                className={`${errors.registrationNumber ? 'border-red-500' : ''}`}
              />
              {errors.registrationNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.registrationNumber.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Address *
              </label>
              <Input
                {...register('address')}
                placeholder="Street Address"
                className={`${errors.address ? 'border-red-500' : ''}`}
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                City *
              </label>
              <Input
                {...register('city')}
                placeholder="City"
                className={`${errors.city ? 'border-red-500' : ''}`}
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                State/Province *
              </label>
              <Input
                {...register('state')}
                placeholder="State/Province"
                className={`${errors.state ? 'border-red-500' : ''}`}
              />
              {errors.state && (
                <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Country *
              </label>
              <Input
                {...register('country')}
                placeholder="Country"
                className={`${errors.country ? 'border-red-500' : ''}`}
              />
              {errors.country && (
                <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Postal Code *
              </label>
              <Input
                {...register('postalCode')}
                placeholder="Postal Code"
                className={`${errors.postalCode ? 'border-red-500' : ''}`}
              />
              {errors.postalCode && (
                <p className="text-red-500 text-sm mt-1">{errors.postalCode.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Maximum Capacity *
              </label>
              <Input
                {...register('capacity')}
                type="number"
                placeholder="Number of children you can accommodate"
                className={`${errors.capacity ? 'border-red-500' : ''}`}
              />
              {errors.capacity && (
                <p className="text-red-500 text-sm mt-1">{errors.capacity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Website (optional)
              </label>
              <Input
                {...register('website')}
                type="url"
                placeholder="https://example.com"
              />
              {errors.website && (
                <p className="text-red-500 text-sm mt-1">{errors.website.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                About Your Orphanage *
              </label>
              <Textarea
                {...register('description')}
                placeholder="Tell us about your orphanage, its mission, and the children you support..."
                rows={5}
                className={`${errors.description ? 'border-red-500' : ''}`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Registration'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
