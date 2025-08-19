import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Navigation } from '@/components/navigation';
import { BookingForm } from '@/components/booking/booking-form';
import { prisma } from '@/lib/prisma';
import { ServiceType } from '@prisma/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, DollarSign } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface BookingPageProps {
  params: {
    serviceType: string;
    date: string;
  };
  searchParams: {
    startTime?: string;
    endTime?: string;
  };
}

async function getServiceAndValidate(serviceType: string) {
  const serviceTypeEnum = serviceType.toUpperCase() as ServiceType;
  
  if (!Object.values(ServiceType).includes(serviceTypeEnum)) {
    return null;
  }
  
  const service = await prisma.service.findFirst({
    where: { 
      type: serviceTypeEnum,
      enabled: true,
    },
  });
  
  return service;
}

export default async function BookingPage({ params, searchParams }: BookingPageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect(`/auth/signin?callbackUrl=/book/${params.serviceType}/${params.date}${searchParams.startTime ? `?startTime=${searchParams.startTime}&endTime=${searchParams.endTime}` : ''}`);
  }

  const service = await getServiceAndValidate(params.serviceType);
  
  if (!service) {
    redirect('/services');
  }
  
  // Parse and validate date
  let bookingDate: Date;
  try {
    bookingDate = parseISO(params.date);
    if (isNaN(bookingDate.getTime())) {
      throw new Error('Invalid date');
    }
  } catch {
    redirect('/availability');
  }
  
  // Default times if not provided
  const startTime = searchParams.startTime || '09:00';
  const endTime = searchParams.endTime || '17:00';
  
  // Calculate pricing
  const basePrice = service.basePriceCents / 100;
  const taxRate = 0.13; // HST
  const depositRate = 0.5; // 50% deposit
  const subtotal = basePrice;
  const taxes = subtotal * taxRate;
  const total = subtotal + taxes;
  const depositAmount = total * depositRate;

  return (
    <>
      <Navigation />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Complete Your Booking</h1>
            <p className="text-gray-600">Fill in the details below to book your {service.name.toLowerCase()} service</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Booking Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-600">{service.description}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{format(bookingDate, 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{startTime} - {endTime}</span>
                  </div>
                  
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Service Fee:</span>
                      <span>${basePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>HST (13%):</span>
                      <span>${taxes.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Total:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-blue-600">
                      <span>Deposit Required:</span>
                      <span>${depositAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Payment Information</span>
                    </div>
                    <p className="text-xs text-blue-700 mt-1">
                      A 50% deposit is required to secure your booking. The remaining balance is due upon service completion.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Form */}
            <div className="lg:col-span-2">
              <BookingForm
                service={service}
                bookingDate={bookingDate}
                startTime={startTime}
                endTime={endTime}
                pricing={{
                  basePrice,
                  taxes,
                  total,
                  depositAmount,
                }}
                user={session.user}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
