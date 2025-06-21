import { db } from '@/db/db';
import { children, orphanages } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const userId = session?.userId;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the orphanage for this user
    const userOrphanage = await db
      .select()
      .from(orphanages)
      .where(eq(orphanages.userId, userId))
      .then(rows => rows[0]);

    if (!userOrphanage) {
      return NextResponse.json(
        { error: 'No orphanage found for this user' },
        { status: 404 }
      );
    }

    const { id } = params;
    
    // Log the incoming request
    console.log(`Updating child ${id} for orphanage ${userOrphanage.id}`);
    
    let body;
    try {
      body = await request.json();
      console.log('Request body:', JSON.stringify(body, null, 2));
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    // Check if child exists and belongs to user's orphanage
    const existingChild = await db
      .select()
      .from(children)
      .where(
        and(
          eq(children.id, id),
          eq(children.orphanageId, userOrphanage.id)
        )
      )
      .then(rows => rows[0]);

    if (!existingChild) {
      console.error(`Child ${id} not found or unauthorized`);
      return NextResponse.json(
        { error: 'Child not found or unauthorized' },
        { status: 404 }
      );
    }

    // Process the update data
    const updateData = { ...body };
    
    // Ensure we don't update the ID or orphanageId
    delete updateData.id;
    delete updateData.orphanageId;
    
    // Process date fields to ensure they're in the correct format
    const dateFields = ['dateOfBirth', 'createdAt', 'updatedAt'];
    const processedData: Record<string, any> = {};
    
    // Log and process each field
    console.log('Processing update data fields:');
    Object.entries(updateData).forEach(([key, value]) => {
      console.log(`- ${key}:`, { value, type: typeof value });
      
      // Skip null/undefined values
      if (value === null || value === undefined) {
        processedData[key] = null;
        return;
      }
      
      // Handle date fields
      if (dateFields.includes(key) && value) {
        try {
          // If it's already a Date object or a string that can be parsed as a date
          const dateValue = value instanceof Date ? value : new Date(value as string);
          if (!isNaN(dateValue.getTime())) {
            processedData[key] = dateValue.toISOString();
          } else {
            console.warn(`Invalid date value for ${key}:`, value);
            processedData[key] = value; // Keep original value if can't parse as date
          }
        } catch (error) {
          console.error(`Error processing date field ${key}:`, error);
          processedData[key] = value; // Keep original value on error
        }
      } else {
        // Keep non-date fields as is
        processedData[key] = value;
      }
    });
    
    // Add/update timestamps
    processedData.updatedAt = new Date().toISOString();
    if (!processedData.createdAt) {
      processedData.createdAt = new Date().toISOString();
    }
    
    console.log('Processed update data:', JSON.stringify(processedData, null, 2));
    
    try {
      console.log('Attempting to update child in database...');
      const result = await db
        .update(children)
        .set(processedData)
        .where(
          and(
            eq(children.id, id),
            eq(children.orphanageId, userOrphanage.id)
          )
        )
        .returning();

      if (!result || result.length === 0) {
        console.error('No rows were updated');
        throw new Error('No rows were updated');
      }

      const [updatedChild] = result;
      console.log('Successfully updated child:', JSON.stringify(updatedChild, null, 2));
      
      // Convert dates to ISO strings for the response
      const responseData: Record<string, any> = { ...updatedChild };
      
      // Safely handle date conversion
      (Object.keys(responseData) as Array<keyof typeof responseData>).forEach((key) => {
        const value = responseData[key];
        if (value instanceof Date) {
          responseData[key] = value.toISOString();
        } else if (value && typeof value === 'object' && 'toISOString' in value) {
          // Handle case where value is a Date-like object
          try {
            responseData[key] = (value as any).toISOString();
          } catch (e) {
            console.warn(`Failed to convert ${String(key)} to ISO string:`, e);
          }
        }
      });
      
      return NextResponse.json(responseData);
    } catch (dbError) {
      console.error('Database error while updating child:', {
        error: dbError,
        message: dbError instanceof Error ? dbError.message : 'Unknown error',
        stack: dbError instanceof Error ? dbError.stack : undefined,
        processedData: JSON.stringify(processedData, null, 2)
      });
      throw dbError;
    }
  } catch (error) {
    console.error('Error updating child:', error);
    return NextResponse.json(
      { error: 'Failed to update child' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const userId = session?.userId;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the orphanage for this user
    const userOrphanage = await db
      .select()
      .from(orphanages)
      .where(eq(orphanages.userId, userId))
      .then(rows => rows[0]);

    if (!userOrphanage) {
      return NextResponse.json(
        { error: 'No orphanage found for this user' },
        { status: 404 }
      );
    }

    const { id } = params;
    
    // Check if child exists and belongs to user's orphanage
    const existingChild = await db
      .select()
      .from(children)
      .where(
        and(
          eq(children.id, id),
          eq(children.orphanageId, userOrphanage.id)
        )
      )
      .then(rows => rows[0]);

    if (!existingChild) {
      return NextResponse.json(
        { error: 'Child not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete child
    await db
      .delete(children)
      .where(
        and(
          eq(children.id, id),
          eq(children.orphanageId, userOrphanage.id)
        )
      );

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting child:', error);
    return NextResponse.json(
      { error: 'Failed to delete child' },
      { status: 500 }
    );
  }
}
