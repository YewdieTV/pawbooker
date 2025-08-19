import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
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

    const { amount, currency, description, paymentMethod } = await request.json();

    // Validate input
    if (!amount || amount < 50) { // Minimum $0.50
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in cents
      currency: currency || 'cad',
      description: description || 'Beautiful Souls Boarding Service',
      metadata: {
        userId: session.user.id,
        userEmail: session.user.email || '',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // For demo purposes, we'll simulate payment confirmation
    // In a real app, you'd use Stripe's client-side library to confirm the payment
    const confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntent.id, {
      payment_method: {
        type: 'card',
        card: {
          number: paymentMethod.card.number,
          exp_month: paymentMethod.card.exp_month,
          exp_year: paymentMethod.card.exp_year,
          cvc: paymentMethod.card.cvc,
        },
        billing_details: paymentMethod.billing_details,
      },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking-confirmation`,
    });

    return NextResponse.json({
      success: true,
      paymentIntent: {
        id: confirmedPaymentIntent.id,
        status: confirmedPaymentIntent.status,
        client_secret: confirmedPaymentIntent.client_secret,
      },
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
