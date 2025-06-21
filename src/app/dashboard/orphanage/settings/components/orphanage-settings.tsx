'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const orphanageSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().min(2, 'Country is required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1'),
});

type OrphanageFormData = z.infer<typeof orphanageSchema>;

export function OrphanageSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OrphanageFormData>({
    resolver: zodResolver(orphanageSchema),
  });

  useEffect(() => {
    const fetchOrphanage = async () => {
      try {
        const response = await fetch('/api/orphanage');
        if (!response.ok) throw new Error('Failed to fetch orphanage data');
        const data = await response.json();
        reset(data);
      } catch (error) {
        console.error('Error fetching orphanage:', error);
        toast.error('Failed to load orphanage data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrphanage();
  }, [reset]);

  const onSubmit = async (data: OrphanageFormData) => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/orphanage', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.error || 'Failed to update orphanage';
        const errorDetails = responseData.details ? `: ${responseData.details}` : '';
        throw new Error(`${errorMessage}${errorDetails}`);
      }
      
      toast.success('Orphanage updated successfully');
    } catch (error) {
      console.error('Error updating orphanage:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update orphanage';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Orphanage Information</h2>
        <p className="text-sm text-muted-foreground">
          Update your orphanage's details and contact information.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Orphanage Name</label>
            <Input {...register('name')} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Email</label>
            <Input type="email" {...register('email')} />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Phone</label>
            <Input {...register('phone')} />
            {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Capacity</label>
            <Input type="number" {...register('capacity')} />
            {errors.capacity && <p className="text-sm text-red-500">{errors.capacity.message}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium leading-none">Address</label>
            <Input {...register('address')} />
            {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">City</label>
            <Input {...register('city')} />
            {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">State/Province</label>
            <Input {...register('state')} />
            {errors.state && <p className="text-sm text-red-500">{errors.state.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Country</label>
            <Input {...register('country')} />
            {errors.country && <p className="text-sm text-red-500">{errors.country.message}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium leading-none">Description</label>
            <Textarea className="min-h-[120px]" {...register('description')} />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
