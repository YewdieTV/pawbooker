'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Lock, Loader2 } from 'lucide-react';

interface PaymentFormProps {
  amount: number;
  currency: string;
  description: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  isLoading: boolean;
}

export function PaymentForm({ amount, currency, description, onSuccess, onError, isLoading }: PaymentFormProps) {
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
  });

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.length <= 19) { // 16 digits + 3 spaces
      setCardData(prev => ({ ...prev, cardNumber: formatted }));
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    if (formatted.length <= 5) { // MM/YY
      setCardData(prev => ({ ...prev, expiryDate: formatted }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentLoading || isLoading) return;
    
    // Basic validation
    if (!cardData.cardNumber || !cardData.expiryDate || !cardData.cvv || !cardData.name) {
      onError('Please fill in all payment details');
      return;
    }
    
    if (cardData.cardNumber.replace(/\s/g, '').length < 13) {
      onError('Please enter a valid card number');
      return;
    }
    
    if (cardData.cvv.length < 3) {
      onError('Please enter a valid CVV');
      return;
    }

    setPaymentLoading(true);
    
    try {
      // Create payment intent
      const paymentResponse = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency.toLowerCase(),
          description,
          paymentMethod: {
            card: {
              number: cardData.cardNumber.replace(/\s/g, ''),
              exp_month: parseInt(cardData.expiryDate.split('/')[0]),
              exp_year: parseInt('20' + cardData.expiryDate.split('/')[1]),
              cvc: cardData.cvv,
            },
            billing_details: {
              name: cardData.name,
            },
          },
        }),
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.error || 'Payment failed');
      }

      const { paymentIntent } = await paymentResponse.json();
      
      // For this demo, we'll assume the payment is successful
      // In a real implementation, you'd use Stripe's client-side library
      onSuccess(paymentIntent.id);
      
    } catch (error) {
      console.error('Payment error:', error);
      onError(error instanceof Error ? error.message : 'Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-green-800">Deposit Required</h3>
            <p className="text-sm text-green-700">
              Secure your booking with a 50% deposit
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-800">
              ${amount.toFixed(2)} CAD
            </div>
            <div className="text-sm text-green-600">
              Deposit amount
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input
                id="cardName"
                value={cardData.name}
                onChange={(e) => setCardData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="John Smith"
                required
              />
            </div>

            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <div className="relative">
                <Input
                  id="cardNumber"
                  value={cardData.cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  required
                />
                <CreditCard className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  value={cardData.expiryDate}
                  onChange={handleExpiryChange}
                  placeholder="MM/YY"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="password"
                  maxLength={4}
                  value={cardData.cvv}
                  onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '') }))}
                  placeholder="123"
                  required
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Lock className="h-4 w-4" />
        <span>Your payment information is secure and encrypted</span>
      </div>

      <Button 
        type="submit" 
        size="lg" 
        className="w-full"
        disabled={paymentLoading || isLoading}
      >
        {paymentLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay ${amount.toFixed(2)} CAD
          </>
        )}
      </Button>
      
      <p className="text-xs text-gray-500 text-center">
        By completing this payment, you agree to our terms of service and cancellation policy.
        The remaining balance will be due upon service completion.
      </p>
    </form>
  );
}
