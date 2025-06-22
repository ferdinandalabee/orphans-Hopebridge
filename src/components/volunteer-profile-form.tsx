'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type VolunteerProfile = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  city: string;
  zipCode: string;
  dateOfBirth: string;
  emergencyContactPhone: string;
  skills: string[];
  availability: string[];
  about: string;
  profileComplete: boolean;
};

export function VolunteerProfileForm({ onComplete }: { onComplete: () => void }) {
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState<VolunteerProfile>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    city: '',
    zipCode: '',
    dateOfBirth: '',
    emergencyContactPhone: '',
    skills: [],
    availability: [],
    about: '',
    profileComplete: false,
  });
  
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof VolunteerProfile, string>>>({});
  
  // Format phone number as (XXX) XXX-XXXX
  const formatPhoneNumber = (value: string): string => {
    if (!value) return value;
    
    // Remove all non-digit characters
    const phoneNumber = value.replace(/\D/g, '');
    const phoneNumberLength = phoneNumber.length;
    
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  // Handle input changes with formatting
  const handleInputChange = <T extends keyof VolunteerProfile>(
    field: T, 
    value: string | string[]
  ) => {
    let formattedValue: string | string[] = value;
    
    // Apply formatting based on field type
    if (field === 'phoneNumber' || field === 'emergencyContactPhone') {
      formattedValue = formatPhoneNumber(value as string);
    } else if (field === 'zipCode') {
      // Only allow numbers and limit to 5 digits
      formattedValue = (value as string).replace(/\D/g, '').slice(0, 5);
    }
    
    setProfile(prev => ({
      ...prev,
      [field]: formattedValue
    }));
    
    // Clear error when user starts typing
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };
  
  // Handle array field changes (skills, availability)
  const handleArrayChange = (field: 'skills' | 'availability', value: string, checked: boolean) => {
    const currentValues = Array.isArray(profile[field]) ? [...(profile[field] as string[])] : [];
    const newValues = checked 
      ? [...currentValues, value]
      : currentValues.filter(item => item !== value);
      
    setProfile(prev => ({
      ...prev,
      [field]: newValues
    }));
    
    // Clear error when user makes a selection
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string | string[]) => {
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const router = useRouter();
  
  useEffect(() => {
    // Fetch existing profile data if it exists
    const fetchProfile = async () => {
      try {
        console.log('Fetching profile data...');
        const response = await fetch('/api/volunteer-profile');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Profile data received:', data);
        
        if (data.profile) {
          setProfile({
            ...data.profile,
            firstName: data.profile.user?.firstName || '',
            lastName: data.profile.user?.lastName || '',
            dateOfBirth: data.profile.dateOfBirth ? new Date(data.profile.dateOfBirth).toISOString().split('T')[0] : ''
          });
        } else if (data.user) {
          // If no profile exists but user data is available
          setProfile(prev => ({
            ...prev,
            firstName: data.user.firstName || '',
            lastName: data.user.lastName || ''
          }));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data. Please refresh the page to try again.');
      }
    };
    
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  const validateForm = () => {
    // Clear any previous errors
    const errors: Partial<Record<keyof VolunteerProfile, string>> = {};

    // Required field validations
    const requiredFields: (keyof VolunteerProfile)[] = [
      'firstName', 'lastName', 'phoneNumber', 'address', 
      'city', 'zipCode', 'dateOfBirth', 'emergencyContactPhone', 'about'
    ];
    
    requiredFields.forEach(field => {
      if (!profile[field]?.toString().trim()) {
        errors[field] = `${field === 'dateOfBirth' ? 'Date of birth' : field.split(/(?=[A-Z])/).join(' ').toLowerCase()} is required`;
      }
    });

    // Specific field validations
    if (profile.phoneNumber && !/^\d{10,}$/.test(profile.phoneNumber.replace(/\D/g, ''))) {
      errors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }

    if (profile.zipCode && !/^\d{5}$/.test(profile.zipCode.replace(/\D/g, ''))) {
      errors.zipCode = 'Please enter a valid 5-digit ZIP code';
    }

    if (profile.dateOfBirth) {
      const dob = new Date(profile.dateOfBirth);
      const today = new Date();
      const minAgeDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
      
      if (dob > minAgeDate) {
        errors.dateOfBirth = 'You must be at least 18 years old';
      } else if (isNaN(dob.getTime())) {
        errors.dateOfBirth = 'Please enter a valid date';
      }
    }

    if (profile.emergencyContactPhone && !/^\d{10,}$/.test(profile.emergencyContactPhone.replace(/\D/g, ''))) {
      errors.emergencyContactPhone = 'Please enter a valid 10-digit phone number';
    }

    if (profile.about?.trim() && profile.about.trim().length < 20) {
      errors.about = 'Please provide more details about yourself (at least 20 characters)';
    }

    // Skills and availability validation
    if (!profile.skills?.length) {
      errors.skills = 'Please select at least one skill';
    }

    if (!profile.availability?.length) {
      errors.availability = 'Please select at least one availability option';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      
      // Scroll to the first error
      const firstError = Object.keys(errors)[0] as keyof typeof errors;
      const element = document.getElementById(firstError);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
      
      return false;
    }

    // Clear any previous errors if validation passes
    setFormErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Clean and prepare the data for submission
      const cleanText = (text: string) => (text || '').trim();
      const cleanPhone = (phone: string) => phone.replace(/\D/g, '');
      
      const submissionData = {
        firstName: cleanText(profile.firstName),
        lastName: cleanText(profile.lastName),
        phoneNumber: cleanPhone(profile.phoneNumber),
        address: cleanText(profile.address),
        city: cleanText(profile.city),
        zipCode: cleanPhone(profile.zipCode).slice(0, 5),
        dateOfBirth: profile.dateOfBirth, // Should be in YYYY-MM-DD format
        emergencyContactPhone: cleanPhone(profile.emergencyContactPhone),
        skills: Array.isArray(profile.skills) ? profile.skills.filter(Boolean) : [],
        availability: Array.isArray(profile.availability) ? profile.availability.filter(Boolean) : [],
        about: cleanText(profile.about || ''),
        profileComplete: true
      };
      
      console.log('Submitting profile data:', JSON.stringify(submissionData, null, 2));
      
      const response = await fetch('/api/volunteer-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        // Handle validation errors from the server
        if (data.errors && Array.isArray(data.errors)) {
          const newErrors: Record<string, string> = {};
          data.errors.forEach((error: { path: string[]; message: string }) => {
            const field = error.path[0];
            if (field in profile) {
              newErrors[field as keyof VolunteerProfile] = error.message;
            }
          });
          setFormErrors(prev => ({
            ...prev,
            ...newErrors
          }));
          
          // Scroll to the first error
          const firstErrorField = Object.keys(newErrors)[0];
          if (firstErrorField) {
            const element = document.getElementById(firstErrorField);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              element.focus();
            }
          }
          
          throw new Error('Please fix the validation errors');
        }
        
        let errorMessage = 'Failed to save profile';
        if (data?.error) {
          errorMessage += `: ${data.error}`;
          if (data.details) {
            errorMessage += ` (${JSON.stringify(data.details)})`;
          }
        } else if (data?.message) {
          errorMessage = data.message;
        } else {
          errorMessage += `: ${response.statusText || 'Unknown error'}`;
        }
        
        throw new Error(errorMessage);
      }
      
      toast.success('Profile saved successfully');
      
      // Call the onComplete callback to update the parent component
      if (onComplete) onComplete();
      
      // Refresh the page to ensure all data is up to date
      router.refresh();
      
    } catch (error) {
      console.error('Error saving profile:', error);
      if (error instanceof Error) {
        // Only show error toast if it's not a validation error (those are shown inline)
        if (error.message !== 'Please fix the validation errors') {
          toast.error(error.message);
        }
      } else {
        toast.error('Failed to save profile');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const skillOptions = [
    'Tutoring', 'Mentoring', 'Arts & Crafts', 'Sports Coaching', 'Music',
    'Cooking', 'First Aid/CPR', 'Language Translation', 'Event Planning', 'Fundraising',
    'Graphic Design', 'Photography', 'Videography', 'Social Media', 'Grant Writing'
  ];

  const availabilityOptions = [
    'Weekday Mornings', 'Weekday Afternoons', 'Weekday Evenings',
    'Weekend Mornings', 'Weekend Afternoons', 'Weekend Evenings',
    'Flexible', 'As Needed'
  ];

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Volunteer Profile</CardTitle>
        <CardDescription>
          Complete your volunteer profile to get started with opportunities.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={profile.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
              />
              {formErrors.firstName && (
                <p className="text-sm text-red-500">{formErrors.firstName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={profile.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required
              />
              {formErrors.lastName && (
                <p className="text-sm text-red-500">{formErrors.lastName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={profile.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="(123) 456-7890"
                required
              />
              {formErrors.phoneNumber && (
                <p className="text-sm text-red-500">{formErrors.phoneNumber}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
              <Input
                id="emergencyContactPhone"
                name="emergencyContactPhone"
                type="tel"
                value={profile.emergencyContactPhone}
                onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                placeholder="(123) 456-7890"
                required
              />
              {formErrors.emergencyContactPhone && (
                <p className="text-sm text-red-500">{formErrors.emergencyContactPhone}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                name="address"
                value={profile.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                required
              />
              {formErrors.address && (
                <p className="text-sm text-red-500">{formErrors.address}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={profile.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                required
              />
              {formErrors.city && (
                <p className="text-sm text-red-500">{formErrors.city}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                name="zipCode"
                value={profile.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                maxLength={5}
                required
              />
              {formErrors.zipCode && (
                <p className="text-sm text-red-500">{formErrors.zipCode}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={profile.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              required
            />
            {formErrors.dateOfBirth && (
              <p className="text-sm text-red-500">{formErrors.dateOfBirth}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Skills</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                'Tutoring', 'Mentoring', 'Event Planning', 'Fundraising',
                'Graphic Design', 'Photography', 'Social Media', 'Translation'
              ].map((skill) => (
                <div key={skill} className="flex items-center space-x-2">
                  <Checkbox
                    id={`skill-${skill}`}
                    checked={profile.skills?.includes(skill) || false}
                    onCheckedChange={(checked) => 
                      handleArrayChange('skills', skill, !!checked)
                    }
                  />
                  <label
                    htmlFor={`skill-${skill}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {skill}
                  </label>
                </div>
              ))}
            </div>
            {formErrors.skills && (
              <p className="text-sm text-red-500">{formErrors.skills}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Availability</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {['Weekdays', 'Weekends', 'Mornings', 'Afternoons', 'Evenings'].map((time) => (
                <div key={time} className="flex items-center space-x-2">
                  <Checkbox
                    id={`avail-${time}`}
                    checked={profile.availability?.includes(time) || false}
                    onCheckedChange={(checked) => 
                      handleArrayChange('availability', time, !!checked)
                    }
                  />
                  <label
                    htmlFor={`avail-${time}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {time}
                  </label>
                </div>
              ))}
            </div>
            {formErrors.availability && (
              <p className="text-sm text-red-500">{formErrors.availability}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="about">About You</Label>
              <span className={`text-xs ${!profile.about || profile.about.length < 20 ? 'text-amber-600' : 'text-green-600'}`}>
                {profile.about?.length || 0}/20 characters minimum
              </span>
            </div>
            <Textarea
              id="about"
              placeholder="Tell us about yourself and why you want to volunteer"
              value={profile.about}
              onChange={(e) => handleInputChange('about', e.target.value)}
              className={`min-h-[120px] ${formErrors.about ? 'border-red-500' : ''}`}
            />
            {formErrors.about && (
              <p className="text-sm text-red-500 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {formErrors.about}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Profile'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
