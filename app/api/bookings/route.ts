import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { BookingStatus } from '@prisma/client';

const CreateBookingSchema = z.object({
  serviceId: z.string(),
  startDateTime: z.string(),
  endDateTime: z.string(),
  priceCents: z.number(),
  notes: z.string().optional(),
  petInfo: z.object({
    name: z.string(),
    breed: z.string(),
    weightKg: z.number(),
    ageYears: z.number(),
    notes: z.string().optional(),
    aggressive: z.boolean(),
    specialCare: z.boolean(),
    vaccinationsUrl: z.array(z.string()).optional(),
  }),
  contactInfo: z.object({
    phone: z.string(),
    address: z.string(),
    emergencyContact: z.string(),
    emergencyPhone: z.string(),
  }),
  paymentIntentId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = CreateBookingSchema.parse(body);

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create or find pet
      const pet = await tx.pet.upsert({
        where: {
          ownerId_name: {
            ownerId: session.user.id,
            name: validated.petInfo.name,
          },
        },
        update: {
          breed: validated.petInfo.breed,
          weightKg: validated.petInfo.weightKg,
          ageYears: validated.petInfo.ageYears,
          notes: validated.petInfo.notes,
          aggressive: validated.petInfo.aggressive,
          specialCare: validated.petInfo.specialCare,
          vaccinationsUrl: validated.petInfo.vaccinationsUrl || [],
        },
        create: {
          ownerId: session.user.id,
          name: validated.petInfo.name,
          breed: validated.petInfo.breed,
          weightKg: validated.petInfo.weightKg,
          ageYears: validated.petInfo.ageYears,
          notes: validated.petInfo.notes,
          aggressive: validated.petInfo.aggressive,
          specialCare: validated.petInfo.specialCare,
          vaccinationsUrl: validated.petInfo.vaccinationsUrl || [],
        },
      });

      // Update user contact info
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          phone: validated.contactInfo.phone,
          address: validated.contactInfo.address,
        },
      });

      // Create booking
      const booking = await tx.booking.create({
        data: {
          clientId: session.user.id,
          petId: pet.id,
          serviceId: validated.serviceId,
          startDateTime: new Date(validated.startDateTime),
          endDateTime: new Date(validated.endDateTime),
          status: BookingStatus.CONFIRMED, // Since payment is confirmed
          priceCents: validated.priceCents,
          notes: validated.notes,
        },
        include: {
          service: true,
          pet: true,
          client: true,
        },
      });

      // Create payment record
      await tx.payment.create({
        data: {
          bookingId: booking.id,
          stripePaymentIntentId: validated.paymentIntentId,
          amountCents: Math.round(validated.priceCents * 0.5), // 50% deposit
          status: 'SUCCEEDED',
          currency: 'CAD',
        },
      });

      return booking;
    });

    // TODO: Send confirmation email
    
    return NextResponse.json({
      success: true,
      booking: {
        id: result.id,
        service: result.service.name,
        pet: result.pet.name,
        startDateTime: result.startDateTime,
        endDateTime: result.endDateTime,
        status: result.status,
      },
    });

  } catch (error) {
    console.error('Booking creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid booking data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}