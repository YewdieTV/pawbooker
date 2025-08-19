import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = headers();
  const signature = headersList.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Update payment record
        await prisma.payment.update({
          where: {
            stripePaymentIntentId: paymentIntent.id,
          },
          data: {
            status: 'SUCCEEDED',
          },
        });

        // Update booking status if this was a deposit payment
        const payment = await prisma.payment.findUnique({
          where: {
            stripePaymentIntentId: paymentIntent.id,
          },
          include: {
            booking: true,
          },
        });

        if (payment?.booking) {
          const metadata = payment.metadata as any;
          if (metadata?.type === 'deposit') {
            await prisma.booking.update({
              where: {
                id: payment.bookingId,
              },
              data: {
                status: 'CONFIRMED',
              },
            });

            // TODO: Send confirmation email
            console.log(`Booking ${payment.bookingId} confirmed via payment ${paymentIntent.id}`);
          }
        }

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        await prisma.payment.update({
          where: {
            stripePaymentIntentId: paymentIntent.id,
          },
          data: {
            status: 'FAILED',
          },
        });

        // TODO: Send payment failed email
        console.log(`Payment failed for payment intent ${paymentIntent.id}`);
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        await prisma.payment.update({
          where: {
            stripePaymentIntentId: paymentIntent.id,
          },
          data: {
            status: 'CANCELED',
          },
        });

        // Cancel associated booking
        const payment = await prisma.payment.findUnique({
          where: {
            stripePaymentIntentId: paymentIntent.id,
          },
        });

        if (payment) {
          await prisma.booking.update({
            where: {
              id: payment.bookingId,
            },
            data: {
              status: 'CANCELED',
            },
          });
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
