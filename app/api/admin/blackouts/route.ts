import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const CreateBlackoutSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().min(1).max(100),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    
    const data = {
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      reason: formData.get('reason') as string,
    };

    const validated = CreateBlackoutSchema.parse(data);
    
    // Validate date logic
    const startDate = new Date(validated.startDate + 'T00:00:00');
    const endDate = new Date(validated.endDate + 'T23:59:59');
    
    if (startDate >= endDate) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }
    
    if (startDate < new Date()) {
      return NextResponse.json(
        { error: 'Start date cannot be in the past' },
        { status: 400 }
      );
    }

    // Check for overlapping blackouts
    const overlapping = await prisma.blackout.findFirst({
      where: {
        OR: [
          {
            AND: [
              { startDateTime: { lte: startDate } },
              { endDateTime: { gte: startDate } }
            ]
          },
          {
            AND: [
              { startDateTime: { lte: endDate } },
              { endDateTime: { gte: endDate } }
            ]
          },
          {
            AND: [
              { startDateTime: { gte: startDate } },
              { endDateTime: { lte: endDate } }
            ]
          }
        ]
      }
    });

    if (overlapping) {
      return NextResponse.json(
        { error: 'This date range overlaps with an existing blackout period' },
        { status: 400 }
      );
    }

    // Create blackout
    await prisma.blackout.create({
      data: {
        startDateTime: startDate,
        endDateTime: endDate,
        reason: validated.reason,
      },
    });

    // Redirect back to blackouts page
    return NextResponse.redirect(new URL('/admin/blackouts', request.url));
    
  } catch (error) {
    console.error('Create blackout error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
