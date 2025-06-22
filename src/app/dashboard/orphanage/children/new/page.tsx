'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/db/utils';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const formSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  dateOfBirth: z.date({
    required_error: 'Date of birth is required',
  }),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
    required_error: 'Please select a gender',
  }),
  bio: z.string().optional(),
  needs: z.string().optional(),
  interests: z.string().optional(),
  image: z
    .any()
    .refine((file) => {
      if (typeof window === 'undefined') return true; // Skip validation on server
      return file && file.length > 0;
    }, 'Image is required')
    .refine((file) => {
      if (typeof window === 'undefined') return true; // Skip validation on server
      return file && file[0]?.size <= MAX_FILE_SIZE;
    }, 'Max image size is 5MB')
    .refine((file) => {
      if (typeof window === 'undefined') return true; // Skip validation on server
      return file && ACCEPTED_IMAGE_TYPES.includes(file[0]?.type);
    }, 'Only .jpg, .jpeg, .png and .webp formats are supported')
    .optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AddChildPage() {
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: 'MALE',
    },
  });

  const dateOfBirth = watch('dateOfBirth');

  const onSubmit = async (data: FormData) => {
    try {
      const formData = new FormData();
      
      // Append all form data
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'dateOfBirth' && value instanceof Date) {
          formData.append(key, value.toISOString().split('T')[0]);
        } else if (key === 'image' && value instanceof FileList && value.length > 0) {
          formData.append('image', value[0]);
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      const response = await fetch('/api/orphanage/children', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add child');
      }

      toast.success('Child added successfully!');
      router.push('/dashboard/orphanage');
    } catch (error: any) {
      console.error('Error adding child:', error);
      toast.error(error.message || 'Failed to add child');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add a Child</h1>
        <p className="text-gray-600">Add a new child to your orphanage</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              placeholder="John"
              {...register('firstName')}
            />
            {errors.firstName && (
              <p className="text-sm text-red-500">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Doe"
              {...register('lastName')}
            />
            {errors.lastName && (
              <p className="text-sm text-red-500">{errors.lastName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <div className="relative">
              <Input
                id="dateOfBirth"
                type="date"
                className="pr-10"
                value={dateOfBirth ? format(dateOfBirth, 'yyyy-MM-dd') : ''}
                onChange={(e) => {
                  const dateValue = e.target.value;
                  if (dateValue) {
                    // Parse the date string in YYYY-MM-DD format
                    const [year, month, day] = dateValue.split('-').map(Number);
                    const date = new Date(year, month - 1, day);
                    if (!isNaN(date.getTime())) { // Check if valid date
                      setValue('dateOfBirth', date);
                    }
                  }
                }}
                onFocus={(e) => {
                  // Show date picker dropdown when input is focused on mobile
                  if (window.innerWidth < 768) {
                    e.target.showPicker();
                  }
                }}
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={(e) => e.preventDefault()}
                  >
                    <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                    <span className="sr-only">Open calendar</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="p-3">
                    <div className="mb-2 grid grid-cols-2 gap-2">
                      <select
                        className="rounded-md border p-2 text-sm"
                        value={dateOfBirth?.getFullYear() || new Date().getFullYear()}
                        onChange={(e) => {
                          const year = parseInt(e.target.value);
                          const newDate = dateOfBirth || new Date();
                          newDate.setFullYear(year);
                          setValue('dateOfBirth', newDate);
                        }}
                      >
                        {Array.from({ length: 100 }, (_, i) => {
                          const year = new Date().getFullYear() - i;
                          return (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          );
                        })}
                      </select>
                      <select
                        className="rounded-md border p-2 text-sm"
                        value={dateOfBirth?.getMonth() || 0}
                        onChange={(e) => {
                          const month = parseInt(e.target.value);
                          const newDate = dateOfBirth || new Date();
                          newDate.setMonth(month);
                          setValue('dateOfBirth', newDate);
                        }}
                      >
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i} value={i}>
                            {new Date(0, i).toLocaleString('default', { month: 'long' })}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Calendar
                      mode="single"
                      selected={dateOfBirth || undefined}
                      onSelect={(date) => setValue('dateOfBirth', date!)}
                      defaultMonth={dateOfBirth || new Date()}
                      disabled={(date) => date > new Date()}
                      className="rounded-md border"
                      captionLayout="dropdown-buttons"
                      fromYear={new Date().getFullYear() - 100}
                      toYear={new Date().getFullYear()}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            {errors.dateOfBirth && (
              <p className="text-sm text-red-500">{errors.dateOfBirth.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Gender</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register('gender')}
            >
              <option value="">Select gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
            {errors.gender && (
              <p className="text-sm text-red-500">{errors.gender.message}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about this child..."
              className="min-h-[100px]"
              {...register('bio')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="needs">Special Needs (optional)</Label>
            <Input
              id="needs"
              placeholder="e.g., Medical conditions, special care"
              {...register('needs')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interests">Interests (optional)</Label>
            <Input
              id="interests"
              placeholder="e.g., Drawing, sports, music"
              {...register('interests')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Child's Photo</Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            className="cursor-pointer border-dashed"
            {...register('image')}
          />
          {errors.image && (
            <p className="text-sm text-red-500">{errors.image.message as string}</p>
          )}
          <p className="text-xs text-gray-500">
            Upload a clear photo of the child (max 5MB, .jpg, .jpeg, .png, .webp)
          </p>
        </div>

        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/orphanage')}
            className="flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Back to Dashboard
          </Button>
          <Button type="submit" className="px-8">
            Add Child
          </Button>
        </div>
      </form>
    </div>
  );
}
