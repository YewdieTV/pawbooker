import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CreateBookingSchema } from '@/lib/validations';
import { getOpenIntervals } from '@/lib/availability';
import { parseISO, isAfter, isBefore } from 'date-fns';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    const whereClause: any = {
      clientId: session.user.id,
    };
    
    if (status) {
      whereClause.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        service: true,
        pet: true,
        payments: true,
      },
      orderBy: {
        startDateTime: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const validatedData = CreateBookingSchema.parse(body);
    
    const startDateTime = parseISO(validatedData.startDateTime);
    const endDateTime = parseISO(validatedData.endDateTime);

    // Verify the slot is still available
    const openIntervals = await getOpenIntervals({
      serviceId: validatedData.serviceId,
      from: startDateTime,
      to: endDateTime,
    });

    const isSlotAvailable = openIntervals.some(interval =>
      (isBefore(interval.start, startDateTime) || interval.start.getTime() === startDateTime.getTime()) &&
      (isAfter(interval.end, endDateTime) || interval.end.getTime() === endDateTime.getTime())
    );

    if (!isSlotAvailable) {
      return NextResponse.json(
        { success: false, error: 'Selected time slot is no longer available' },
        { status: 400 }
      );
    }

    // Get service details for pricing
    const service = await prisma.service.findUnique({
      where: { id: validatedData.serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      );
    }

    // Calculate pricing based on service type and duration
    let priceCents = service.basePriceCents;
    
    if (service.type === 'BOARDING') {
      // Calculate nights for boarding
      const diffTime = endDateTime.getTime() - startDateTime.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      priceCents = service.basePriceCents * diffDays;
    }

    // Get business settings for deposit calculation
    const businessSettings = await prisma.businessSettings.findUnique({
      where: { id: 'singleton' },
    });

    const depositPct = businessSettings?.depositPct || 50;
    const depositCents = Math.round(priceCents * (depositPct / 100));

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        clientId: session.user.id,
        petId: validatedData.petId,
        serviceId: validatedData.serviceId,
        startDateTime,
        endDateTime,
        priceCents,
        notes: validatedData.notes,
        status: 'PENDING',
      },
      include: {
        service: true,
        pet: true,
      },
    });

    // Create Stripe PaymentIntent for deposit
    const paymentIntent = await stripe.paymentIntents.create({
      amount: depositCents,
      currency: 'cad',
      metadata: {
        bookingId: booking.id,
        type: 'deposit',
      },
    });

    // Store payment record
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        stripePaymentIntentId: paymentIntent.id,
        amountCents: depositCents,
        status: 'PENDING',
        metadata: {
          type: 'deposit',
          fullAmount: priceCents,
        },
      },
    });

    return NextResponse.json({
      success: true,
      booking,
      paymentIntent: {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: depositCents,
      },
    });
  } catch (error) {
    console.error('Create booking error:', error);
    
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
