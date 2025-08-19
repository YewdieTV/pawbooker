'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { PetForm } from './pet-form';
import { PaymentForm } from './payment-form';
import { Dog, CreditCard, FileText, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Service {
  id: string;
  name: string;
  type: string;
  basePriceCents: number;
  capacity: number;
}

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

interface Pricing {
  basePrice: number;
  taxes: number;
  total: number;
  depositAmount: number;
}

interface BookingFormProps {
  service: Service;
  bookingDate: Date;
  startTime: string;
  endTime: string;
  pricing: Pricing;
  user: User;
}

interface PetInfo {
  name: string;
  breed: string;
  weightKg: number;
  ageYears: number;
  notes: string;
  aggressive: boolean;
  specialCare: boolean;
  vaccinationsUrl: string[];
}

export function BookingForm({ service, bookingDate, startTime, endTime, pricing, user }: BookingFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data
  const [petInfo, setPetInfo] = useState<PetInfo>({
    name: '',
    breed: '',
    weightKg: 0,
    ageYears: 0,
    notes: '',
    aggressive: false,
    specialCare: false,
    vaccinationsUrl: [],
  });
  
  const [contactInfo, setContactInfo] = useState({
    phone: user.phone || '',
    address: user.address || '',
    emergencyContact: '',
    emergencyPhone: '',
  });
  
  const [bookingNotes, setBookingNotes] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleStepComplete = (step: number) => {
    if (step === 1) {
      // Validate pet info
      if (!petInfo.name || !petInfo.breed || petInfo.weightKg <= 0 || petInfo.ageYears <= 0) {
        setError('Please fill in all required pet information');
        return;
      }
      setError(null);
      setCurrentStep(2);
    } else if (step === 2) {
      // Validate contact info
      if (!contactInfo.phone || !contactInfo.address || !contactInfo.emergencyContact || !contactInfo.emergencyPhone) {
        setError('Please fill in all required contact information');
        return;
      }
      if (!agreedToTerms) {
        setError('Please agree to the terms and conditions');
        return;
      }
      setError(null);
      setCurrentStep(3);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    setIsLoading(true);
    try {
      // Create the booking
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: service.id,
          startDateTime: `${format(bookingDate, 'yyyy-MM-dd')}T${startTime}:00`,
          endDateTime: `${format(bookingDate, 'yyyy-MM-dd')}T${endTime}:00`,
          priceCents: Math.round(pricing.total * 100),
          notes: bookingNotes,
          petInfo,
          contactInfo,
          paymentIntentId,
        }),
      });

      if (!bookingResponse.ok) {
        throw new Error('Failed to create booking');
      }

      const booking = await bookingResponse.json();
      
      // Redirect to confirmation page
      router.push(`/booking-confirmation/${booking.id}`);
      
    } catch (error) {
      console.error('Booking creation error:', error);
      setError('Failed to create booking. Please contact support.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center space-x-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= step 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {step}
            </div>
            <span className={`ml-2 text-sm font-medium ${
              currentStep >= step ? 'text-blue-600' : 'text-gray-500'
            }`}>
              {step === 1 ? 'Pet Info' : step === 2 ? 'Contact Details' : 'Payment'}
            </span>
            {step < 3 && <div className="mx-4 h-px bg-gray-300 w-12" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Step 1: Pet Information */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Dog className="h-5 w-5" />
              <span>Pet Information</span>
            </CardTitle>
            <CardDescription>
              Tell us about your furry friend so we can provide the best care
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <PetForm petInfo={petInfo} onChange={setPetInfo} />
            
            <div className="flex justify-end">
              <Button onClick={() => handleStepComplete(1)}>
                Continue to Contact Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Contact Information */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Contact Information</span>
            </CardTitle>
            <CardDescription>
              We need this information for pickup/dropoff and emergencies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(647) 123-4567"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={contactInfo.address}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main St, Toronto, ON"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="emergencyContact">Emergency Contact Name *</Label>
                <Input
                  id="emergencyContact"
                  value={contactInfo.emergencyContact}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, emergencyContact: e.target.value }))}
                  placeholder="John Smith"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="emergencyPhone">Emergency Contact Phone *</Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  value={contactInfo.emergencyPhone}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                  placeholder="(647) 123-4567"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="bookingNotes">Additional Notes (Optional)</Label>
              <Textarea
                id="bookingNotes"
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                placeholder="Any special instructions, medications, feeding requirements, etc."
                rows={4}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              />
              <Label htmlFor="terms" className="text-sm">
                I agree to the terms and conditions and understand the cancellation policy *
              </Label>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Back to Pet Info
              </Button>
              <Button onClick={() => handleStepComplete(2)}>
                Continue to Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Payment */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Payment</span>
            </CardTitle>
            <CardDescription>
              Secure payment processing by Stripe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentForm
              amount={pricing.depositAmount}
              currency="cad"
              description={`${service.name} - ${format(bookingDate, 'MMM d, yyyy')}`}
              onSuccess={handlePaymentSuccess}
              onError={(error) => setError(error)}
              isLoading={isLoading}
            />
            
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                Back to Contact Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
