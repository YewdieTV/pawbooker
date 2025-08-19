import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CreateHoldSchema } from '@/lib/validations';
import { holdSlot } from '@/lib/availability';
import { parseISO } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = CreateHoldSchema.parse(body);
    
    const bookingDraft = {
      serviceId: validatedData.serviceId,
      startDateTime: parseISO(validatedData.startDateTime),
      endDateTime: parseISO(validatedData.endDateTime),
      clientId: validatedData.clientId,
      petId: validatedData.petId,
      priceCents: validatedData.priceCents,
      notes: validatedData.notes,
    };

    const holdId = await holdSlot(bookingDraft);

    return NextResponse.json({
      success: true,
      holdId,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes from now
    });
  } catch (error) {
    console.error('Create hold error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { prisma } = await import('@/lib/prisma');
    
    const holds = await prisma.booking.findMany({
      where: {
        status: 'HELD',
        holdExpiresAt: {
          gte: new Date(),
        },
      },
      include: {
        client: {
          select: {
            name: true,
            email: true,
          },
        },
        pet: {
          select: {
            name: true,
          },
        },
        service: {
          select: {
            name: true,
            type: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      holds,
    });
  } catch (error) {
    console.error('Get holds error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
