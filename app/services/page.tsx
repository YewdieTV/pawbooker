import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  PawPrint, 
  Heart, 
  Clock, 
  Calendar,
  Check,
  Star,
  MapPin,
  Shield,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export default function ServicesPage() {
  const services = [
    {
      id: 'boarding',
      title: 'Overnight Boarding',
      description: 'Your dog stays overnight at our home-like facility with 24/7 care, love, and personalized attention.',
      icon: PawPrint,
      price: 6200, // $62.00 per night
      priceUnit: 'per night',
      priceOptions: [
        { label: 'Standard Rate', price: 6200 },
        { label: 'Holiday Rate', price: 7800 },
        { label: 'Additional Dog', price: 4500, note: '+$45 per night' },
        { label: 'Puppy Rate', price: 7300 },
        { label: '10+ Nights', price: 5000, note: 'Extended stay discount' }
      ],
      capacity: 10,
      features: [
        '24/7 loving supervision',
        'Home-like environment',
        'Individual attention and care',
        'Regular feeding & medication',
        'Exercise and playtime',
        'Daily health monitoring',
        'Photo updates for owners',
        'Emergency veterinary care',
        'Comfortable sleeping areas',
        'Socialization with other dogs'
      ],
      requirements: [
        'Current vaccination records required',
        'Flea and tick prevention up to date',
        'Behavioral assessment for first-time guests',
        'Emergency contact information'
      ],
      popular: true,
    },
    {
      id: 'daycare',
      title: 'Daycare',
      description: 'Daytime care and socialization for your dog while you work. A safe, fun environment with lots of love and attention.',
      icon: Heart,
      price: 4500, // $45.00 per day
      priceUnit: 'per day',
      priceOptions: [
        { label: 'Standard Rate', price: 4500 },
        { label: 'Holiday Rate', price: 6200 },
        { label: 'Additional Dog', price: 3400, note: '+$34 per day' },
        { label: 'Puppy Rate', price: 5600 }
      ],
      capacity: 15,
      features: [
        'Social play groups by temperament',
        'Indoor and outdoor activities',
        'Supervised playtime',
        'Rest periods and nap time',
        'Feeding and water included',
        'Individual attention',
        'Daily report cards',
        'Safe, clean environment',
        'Emergency care available',
        'Loving, professional staff'
      ],
      requirements: [
        'Current vaccination records required',
        'Socialization assessment',
        'Spayed/neutered (6+ months)',
        'Flea and tick prevention'
      ],
    },
  ];

  const addOns = [
    { name: 'Bath & Brush', price: 1500, description: 'Full bath and brushing service' },
    { name: 'Nail Trim', price: 800, description: 'Professional nail trimming' },
    { name: 'Feeding Premium Food', price: 500, description: 'We provide high-quality food' },
    { name: 'Medication Administration', price: 300, description: 'Per medication, per dose' },
  ];

  return (
    <>
      <Navigation />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Professional Dog Care Services
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Comprehensive care options for your furry family member. All services include professional staff, 
                insurance coverage, and your peace of mind.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/book-with-assistant">Book with Melissa</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/availability">Check Availability</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <Card key={service.id} className={`relative ${service.popular ? 'ring-2 ring-blue-500' : ''}`}>
                    {service.popular && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                          <Star className="h-3 w-3 mr-1" />
                          Most Popular
                        </span>
                      </div>
                    )}
                    
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Icon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">{service.title}</CardTitle>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Users className="h-4 w-4" />
                              <span>Capacity: {service.capacity} dogs</span>
                            </div>
                          </div>
                        </div>
                                              <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          From {formatCurrency(service.price)}
                        </div>
                        <div className="text-sm text-gray-500">{service.priceUnit}</div>
                      </div>
                      </div>
                      <CardDescription className="text-base">
                        {service.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      {/* Pricing Options */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Pricing Options:</h4>
                        <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                          {service.priceOptions.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex justify-between items-center text-sm">
                              <span className="text-blue-900 font-medium">{option.label}:</span>
                              <div className="text-right">
                                <span className="text-blue-800 font-semibold">{formatCurrency(option.price)}</span>
                                {option.note && (
                                  <div className="text-xs text-blue-600">{option.note}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Features */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">What's Included:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {service.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center text-sm text-gray-600">
                              <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Requirements */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Requirements:</h4>
                        <ul className="space-y-1">
                          {service.requirements.map((requirement, reqIndex) => (
                            <li key={reqIndex} className="flex items-center text-sm text-gray-600">
                              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2 flex-shrink-0"></div>
                              {requirement}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <Button asChild className="w-full">
                          <Link href="/book-with-assistant">Book This Service</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Add-ons Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Add-On Services</h2>
              <p className="text-lg text-gray-600">
                Enhance your dog's experience with our additional services
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {addOns.map((addon, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <h3 className="font-semibold text-lg mb-2">{addon.name}</h3>
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        {formatCurrency(addon.price)}
                      </div>
                      <p className="text-sm text-gray-600">{addon.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Info */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">Pricing Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center">
                      <Shield className="h-5 w-5 text-green-500 mr-2" />
                      Booking & Payment
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• 50% deposit required to confirm booking</li>
                      <li>• Remaining balance due before service</li>
                      <li>• HST (13%) applies to all services</li>
                      <li>• Secure payment processing via Stripe</li>
                      <li>• Cancellation allowed up to 24 hours prior</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center">
                      <MapPin className="h-5 w-5 text-blue-500 mr-2" />
                      Service Area & Hours
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Serving the GTA and surrounding areas</li>
                      <li>• Monday - Sunday: Open 24/7</li>
                      <li>• Available around the clock for your pet's needs</li>
                      <li>• Emergency care always available</li>
                    </ul>
                  </div>
                </div>
                
                <div className="pt-6 border-t text-center">
                  <p className="text-sm text-gray-500 mb-4">
                    All prices are in Canadian dollars. Group discounts available for multiple pets.
                  </p>
                  <Button asChild size="lg">
                    <Link href="/book-with-assistant">Get Started with Booking</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}
