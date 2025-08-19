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
      description: 'Your dog stays overnight at our facility with 24/7 care, comfortable sleeping areas, and personalized attention.',
      icon: PawPrint,
      price: 8000, // cents
      priceUnit: 'per night',
      capacity: 3,
      features: [
        '24/7 professional supervision',
        'Climate-controlled sleeping areas',
        'Regular feeding schedule',
        'Exercise and playtime',
        'Medication administration',
        'Daily health monitoring',
        'Photo updates for owners',
        'Emergency veterinary care'
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
      description: 'Daytime care and socialization for your dog while you\'re at work. Perfect for busy pet parents who want their dogs to stay active.',
      icon: Heart,
      price: 5000,
      priceUnit: 'per day',
      capacity: 5,
      features: [
        'Social play groups by size/temperament',
        'Indoor and outdoor activities',
        'Supervised playtime',
        'Rest periods and nap time',
        'Feeding and water breaks',
        'Basic grooming (brushing)',
        'Training reinforcement',
        'Daily report card'
      ],
      requirements: [
        'Current vaccination records required',
        'Socialization assessment',
        'Spayed/neutered (6+ months)',
        'Flea and tick prevention'
      ],
    },
    {
      id: 'walk-30',
      title: '30-Minute Walk',
      description: 'A refreshing 30-minute neighborhood walk to keep your dog healthy, happy, and well-exercised.',
      icon: Clock,
      price: 2500,
      priceUnit: 'per walk',
      capacity: 3,
      features: [
        'Neighborhood exploration',
        'Leash training reinforcement',
        'Bathroom breaks',
        'Light exercise and stimulation',
        'Photo updates',
        'Basic commands practice',
        'Weather-appropriate gear',
        'Post-walk report'
      ],
      requirements: [
        'Well-socialized with other dogs',
        'Good leash manners',
        'Current vaccination records',
        'Emergency contact information'
      ],
    },
    {
      id: 'walk-60',
      title: '60-Minute Walk',
      description: 'An extended 60-minute adventure walk with extra exercise, exploration, and mental stimulation for active dogs.',
      icon: Clock,
      price: 4000,
      priceUnit: 'per walk',
      capacity: 2,
      features: [
        'Extended neighborhood exploration',
        'Park visits when possible',
        'Advanced exercise routines',
        'Mental stimulation activities',
        'Detailed photo updates',
        'Training reinforcement',
        'Social interaction opportunities',
        'Comprehensive post-walk report'
      ],
      requirements: [
        'High energy or large breed dogs',
        'Excellent leash manners',
        'Well-socialized',
        'Current health clearance'
      ],
    },
    {
      id: 'dropin-30',
      title: '30-Minute Drop-in Visit',
      description: 'Quick check-in visits for feeding, bathroom breaks, and companionship when you\'re away.',
      icon: Calendar,
      price: 2000,
      priceUnit: 'per visit',
      capacity: 1,
      features: [
        'Feeding and fresh water',
        'Bathroom break',
        'Basic companionship',
        'Medication administration',
        'Mail/package collection',
        'Plant watering',
        'Security check',
        'Visit summary report'
      ],
      requirements: [
        'Comfortable with strangers',
        'Clear feeding instructions',
        'Emergency contact information',
        'Access arrangements'
      ],
    },
    {
      id: 'dropin-45',
      title: '45-Minute Drop-in Visit',
      description: 'Extended visits with additional playtime, longer walks, and more comprehensive care.',
      icon: Calendar,
      price: 3000,
      priceUnit: 'per visit',
      capacity: 1,
      features: [
        'Extended feeding and water time',
        'Longer bathroom/garden time',
        'Playtime and interaction',
        'Short neighborhood walk',
        'Medication administration',
        'Basic grooming (brushing)',
        'Home security check',
        'Detailed visit report with photos'
      ],
      requirements: [
        'Comfortable with extended visits',
        'Basic leash training',
        'Clear care instructions',
        'Emergency veterinary contact'
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
                  <Link href="/book-with-assistant">Book with AI Assistant</Link>
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
                            {formatCurrency(service.price)}
                          </div>
                          <div className="text-sm text-gray-500">{service.priceUnit}</div>
                        </div>
                      </div>
                      <CardDescription className="text-base">
                        {service.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
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
                      <li>• Serving Toronto and surrounding areas</li>
                      <li>• Monday - Friday: 8:00 AM - 6:00 PM</li>
                      <li>• Saturday: 9:00 AM - 5:00 PM</li>
                      <li>• Sunday: Closed (except boarding pickups)</li>
                      <li>• Holiday schedules may vary</li>
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
