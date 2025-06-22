import { db } from '@/db';
import { volunteerProfiles, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { volunteerProfileSchema } from '@/db/schema';

type RequestType = NextRequest & {
  json: () => Promise<any>;
};

export async function GET(req: Request) {
  try {
    const { userId } = getAuth(req as any);
    
    if (!userId) {
      console.error('Unauthorized: No user ID found');
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in to continue' },
        { status: 401 }
      );
    }

    // First, check if the user exists in the users table
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
      columns: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImageUrl: true
      }
    });

    if (!user) {
      console.error('User not found in database');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Then get the volunteer profile
    const profile = await db.query.volunteerProfiles.findFirst({
      where: (volunteerProfiles, { eq }) => eq(volunteerProfiles.userId, userId),
    });

    if (!profile) {
      console.log('No profile found for user:', userId);
      return NextResponse.json(
        { profile: null, user },
        { status: 200 }
      );
    }

    // Combine user and profile data
    const combinedData = {
      ...profile,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileImageUrl: user.profileImageUrl
      }
    };

    return NextResponse.json({ profile: combinedData });
  } catch (error) {
    console.error('Error fetching volunteer profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log('Starting POST /api/volunteer-profile');
    const { userId } = getAuth(request as any);
    
    if (!userId) {
      console.error('Unauthorized: No user ID found');
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in to continue' },
        { status: 401 }
      );
    }

    // Get the request body
    let body;
    try {
      body = await request.json();
      console.log('Received request body:', JSON.stringify(body, null, 2));
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json(
        { 
          error: 'Invalid JSON in request body',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 400 }
      );
    }
    
    // Basic validation for required fields
    const requiredFields = [
      'firstName', 'lastName', 'phoneNumber', 'address', 
      'city', 'zipCode', 'dateOfBirth', 'emergencyContactPhone'
    ];
    
    const missingFields = requiredFields.filter(field => !body[field]);
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return NextResponse.json(
        {
          error: 'Missing required fields',
          missingFields,
          received: Object.keys(body)
        },
        { status: 400 }
      );
    }
    
    // Clean and validate the data
    const cleanedData = {
      firstName: body.firstName?.toString().trim(),
      lastName: body.lastName?.toString().trim(),
      phoneNumber: body.phoneNumber?.toString().replace(/\D/g, '') || '',
      address: body.address?.toString().trim(),
      city: body.city?.toString().trim(),
      zipCode: body.zipCode?.toString().replace(/\D/g, '').substring(0, 5) || '',
      dateOfBirth: body.dateOfBirth, // Will be validated by Zod
      emergencyContactPhone: body.emergencyContactPhone?.toString().replace(/\D/g, '') || '',
      about: body.about?.toString().trim() || '',
      skills: Array.isArray(body.skills) ? body.skills : [],
      availability: Array.isArray(body.availability) ? body.availability : [],
      profileComplete: Boolean(body.profileComplete)
    };
    
    console.log('Cleaned data before validation:', JSON.stringify(cleanedData, null, 2));
    
    // Validate the request body
    const validation = volunteerProfileSchema.safeParse(cleanedData);
    
    if (!validation.success) {
      // Create a simple error message from the validation errors
      const errorMessages: string[] = [];
      const formatError = (error: any): string => {
        if (typeof error === 'string') return error;
        if (error?.message) return error.message;
        if (Array.isArray(error)) return error.map(formatError).filter(Boolean).join(', ');
        if (typeof error === 'object' && error !== null) {
          return Object.values(error)
            .map(formatError)
            .filter(Boolean)
            .join(', ');
        }
        return 'Invalid value';
      };

      const errorMessage = formatError(validation.error.format());
      
      console.error('Validation failed:', {
        input: cleanedData,
        error: errorMessage,
        rawErrors: validation.error.format()
      });
      
      return NextResponse.json(
        { 
          error: 'Validation failed',
          message: errorMessage || 'Please check your input and try again.',
          details: validation.error.format()
        },
        { status: 400 }
      );
    }

    const { data } = validation;
    console.log('Validated data:', data);
    
    // Parse date of birth - handle both string and Date objects
    let dateOfBirth: Date;
    try {
      // If it's already a Date object or a valid date string
      if (data.dateOfBirth instanceof Date) {
        dateOfBirth = data.dateOfBirth;
      } else if (typeof data.dateOfBirth === 'string') {
        // If it's an ISO string or YYYY-MM-DD format
        dateOfBirth = new Date(data.dateOfBirth);
      } else {
        throw new Error('Invalid date format');
      }
      
      // Validate the date
      if (isNaN(dateOfBirth.getTime())) {
        throw new Error('Invalid date format');
      }
      
      // Ensure we're working with the start of the day in local time
      dateOfBirth = new Date(
        dateOfBirth.getFullYear(),
        dateOfBirth.getMonth(),
        dateOfBirth.getDate()
      );
      
    } catch (error) {
      console.error('Error parsing date of birth:', error, 'Input date:', data.dateOfBirth);
      return NextResponse.json(
        { 
          error: 'Invalid date of birth format.',
          details: 'Please use YYYY-MM-DD format.',
          received: data.dateOfBirth
        },
        { status: 400 }
      );
    }
    
    // Check if profile already exists
    const existingProfile = await db.query.volunteerProfiles.findFirst({
      where: eq(volunteerProfiles.userId, userId),
    });

    const profileData = {
      userId,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      address: data.address,
      city: data.city,
      zipCode: data.zipCode,
      dateOfBirth,
      emergencyContactPhone: data.emergencyContactPhone,
      skills: data.skills,
      availability: data.availability,
      about: data.about,
      profileComplete: data.profileComplete,
      updatedAt: new Date()
    };
    
    console.log('Prepared profile data:', profileData);

    let profile;
    
    try {
      if (existingProfile) {
        // Update existing profile
        [profile] = await db
          .update(volunteerProfiles)
          .set(profileData)
          .where(eq(volunteerProfiles.id, existingProfile.id))
          .returning();
      } else {
        // Create new profile
        [profile] = await db
          .insert(volunteerProfiles)
          .values({
            id: crypto.randomUUID(),
            ...profileData,
            createdAt: new Date()
          })
          .returning();
      }

      console.log('Profile saved successfully:', profile);
      return NextResponse.json({ 
        success: true, 
        profile,
        message: 'Profile saved successfully' 
      });
      
    } catch (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save profile to database');
    }
  } catch (error) {
    console.error('Error saving volunteer profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
