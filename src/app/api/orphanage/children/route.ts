import { db } from '@/db/db';
import { children, orphanages } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

// Ensure the uploads directory exists
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';

const UPLOAD_DIR = join(process.cwd(), 'public/uploads/children');
const UPLOAD_PATH = '/uploads/children/';

async function saveFile(file: File): Promise<string> {
  try {
    // Create uploads directory if it doesn't exist
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Generate a unique filename
    const ext = file.name.split('.').pop();
    const filename = `${randomUUID()}.${ext}`;
    const path = join(UPLOAD_DIR, filename);
    
    await writeFile(path, buffer);
    
    return `${UPLOAD_PATH}${filename}`;
  } catch (error) {
    console.error('Error saving file:', error);
    throw new Error('Failed to save file');
  }
}

export async function POST(request: Request) {
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

    // Parse form data
    const formData = await request.formData();
    
    // Extract form data
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const dateOfBirth = formData.get('dateOfBirth') as string;
    const gender = formData.get('gender') as 'MALE' | 'FEMALE' | 'OTHER';
    const bio = formData.get('bio') as string | null;
    const needs = formData.get('needs') as string | null;
    const interests = formData.get('interests') as string | null;
    const imageFile = formData.get('image') as File | null;
    
    // Validate required fields
    if (!firstName || !lastName || !dateOfBirth || !gender) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    try {
      // Handle file upload if present
      let photoUrl: string | null = null;
      if (imageFile && imageFile.size > 0) {
        photoUrl = await saveFile(imageFile);
      }

      // Insert new child
      const [newChild] = await db
        .insert(children)
        .values({
          id: crypto.randomUUID(),
          orphanageId: userOrphanage.id,
          firstName,
          lastName,
          dateOfBirth: new Date(dateOfBirth),
          gender,
          photoUrl,
          bio: bio || null,
          needs: needs ? [needs] : [],
          interests: interests ? [interests] : [],
          isAdopted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return NextResponse.json(newChild, { status: 201 });
    } catch (error) {
      console.error('Error creating child:', error);
      return NextResponse.json(
        { error: 'Failed to create child' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error adding child:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
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
        { data: [] },
        { status: 200 }
      );
    }

    // Get all children for this orphanage
    const childrenList = await db
      .select()
      .from(children)
      .where(eq(children.orphanageId, userOrphanage.id));

    return NextResponse.json({ data: childrenList });
  } catch (error) {
    console.error('Error fetching children:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
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
    const body = await request.json();
    
    // Check if child exists and belongs to user's orphanage
    const existingChild = await db
      .select()
      .from(children)
      .where(eq(children.id, id))
      .then(rows => rows[0]);

    if (!existingChild) {
      return NextResponse.json(
        { error: 'Child not found' },
        { status: 404 }
      );
    }

    if (existingChild.orphanageId !== userOrphanage.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update child
    const [updatedChild] = await db
      .update(children)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(children.id, id))
      .returning();

    return NextResponse.json(updatedChild);
  } catch (error) {
    console.error('Error updating child:', error);
    return NextResponse.json(
      { error: 'Failed to update child' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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
      .where(eq(children.id, id))
      .then(rows => rows[0]);

    if (!existingChild) {
      return NextResponse.json(
        { error: 'Child not found' },
        { status: 404 }
      );
    }

    if (existingChild.orphanageId !== userOrphanage.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Delete child
    await db
      .delete(children)
      .where(eq(children.id, id));

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting child:', error);
    return NextResponse.json(
      { error: 'Failed to delete child' },
      { status: 500 }
    );
  }
}
