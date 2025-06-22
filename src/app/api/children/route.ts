import { db } from '@/db';
import { children, orphanages } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const childrenData = await db
      .select({
        id: children.id,
        firstName: children.firstName,
        lastName: children.lastName,
        dateOfBirth: children.dateOfBirth,
        gender: children.gender,
        photoUrl: children.photoUrl,
        bio: children.bio,
        needs: children.needs,
        interests: children.interests,
        isAdopted: children.isAdopted,
        orphanage: {
          id: orphanages.id,
          name: orphanages.name,
          city: orphanages.city,
          state: orphanages.state
          // No photo_url field exists in the orphanages table
        }
      })
      .from(children)
      .leftJoin(orphanages, eq(children.orphanageId, orphanages.id))
      .where(eq(children.isAdopted, false));

    return NextResponse.json(childrenData);
  } catch (error) {
    console.error('Error fetching children:', error);
    return NextResponse.json(
      { error: 'Failed to fetch children' },
      { status: 500 }
    );
  }
}
