import { db } from '@/db';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { orphanages } from '@/db/schema';

export async function GET() {
  try {
    console.log('Fetching orphanage data...');
    
    const { userId } = await auth();
    console.log('Authenticated user ID:', userId);
    
    if (!userId) {
      console.log('No user ID found - unauthorized');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find the orphanage associated with the current user
    console.log('Querying database for orphanage with userId:', userId);
    const result = await db
      .select()
      .from(orphanages)
      .where(eq(orphanages.userId, userId));

    console.log('Database query result:', result);
    const orphanage = result[0];

    if (!orphanage) {
      console.log('No orphanage found for user:', userId);
      return NextResponse.json(
        { error: 'No orphanage found for this user' },
        { status: 404 }
      );
    }

    console.log('Found orphanage:', orphanage.id);
    return NextResponse.json(orphanage);
    
  } catch (error) {
    console.error('Error in GET /api/orphanage:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    console.log('Updating orphanage data...');
    
    const { userId } = await auth();
    console.log('Authenticated user ID:', userId);
    
    if (!userId) {
      console.log('No user ID found - unauthorized');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the request body
    const body = await request.json();
    console.log('Request body:', body);

    // Find the orphanage associated with the current user
    console.log('Querying database for orphanage with userId:', userId);
    const result = await db
      .select()
      .from(orphanages)
      .where(eq(orphanages.userId, userId));

    const orphanage = result[0];

    if (!orphanage) {
      console.log('No orphanage found for user:', userId);
      return NextResponse.json(
        { error: 'No orphanage found for this user' },
        { status: 404 }
      );
    }

    console.log('Updating orphanage:', orphanage.id);
    
    // Update the orphanage with the new data
    const updatedOrphanage = await db
      .update(orphanages)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(orphanages.id, orphanage.id))
      .returning();

    console.log('Successfully updated orphanage:', updatedOrphanage);
    return NextResponse.json(updatedOrphanage[0]);
    
  } catch (error) {
    console.error('Error in PATCH /api/orphanage:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update orphanage', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
