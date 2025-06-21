import { db } from '@/db/db';
import { orphanages, users, userSchema, orphanageSchema } from '@/db/schema';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    // Get current user from Clerk
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = clerkUser.id;
    // Check if user exists in our database
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .then(rows => rows[0]);

    // If user doesn't exist in our database, create them
    if (!existingUser) {
      const userData = {
        id: userId,
        email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        profileImageUrl: clerkUser.imageUrl || '',
      };

      const validatedUser = userSchema.parse(userData);
      await db.insert(users).values(validatedUser);
    }

    // Check if user already has an orphanage
    const existingOrphanage = await db
      .select()
      .from(orphanages)
      .where(eq(orphanages.userId, userId));

    if (existingOrphanage.length > 0) {
      return NextResponse.json(
        { error: 'You have already registered an orphanage' },
        { status: 400 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validation = orphanageSchema.safeParse({
      ...body,
      capacity: parseInt(body.capacity, 10),
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    // Insert into database
    const [newOrphanage] = await db
      .insert(orphanages)
      .values({
        ...validation.data,
        id: crypto.randomUUID(),
        userId,
      })
      .returning();

    return NextResponse.json(
      { data: newOrphanage, message: 'Orphanage registered successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering orphanage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = user.id;

    const userOrphanages = await db
      .select()
      .from(orphanages)
      .where(eq(orphanages.userId, userId));

    return NextResponse.json({ data: userOrphanages });
  } catch (error) {
    console.error('Error fetching orphanages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
