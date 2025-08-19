import Link from 'next/link';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PawPrint, 
  Calendar, 
  Shield, 
  Clock, 
  Heart, 
  Star,
  MapPin,
  Phone,
  Mail,
  MessageCircle
} from 'lucide-react';

export default function HomePage() {
  const services = [
    {
      title: 'Overnight Boarding',
      description: 'Your dog stays overnight at our facility with 24/7 care, love, and attention in a home-like environment.',
      price: 'From $62/night',
      pricingDetails: [
        'Standard Rate: $62/night',
        'Holiday Rate: $78/night', 
        'Additional Dog: +$45/night',
        'Puppy Rate: $73/night',
        '10+ Nights: $50/night'
      ],
      icon: PawPrint,
      features: ['24/7 supervision', 'Home-like environment', 'Regular feeding & medication', 'Exercise and playtime', 'Individual attention', 'Daily updates', 'Emergency care available', 'Comfortable sleeping areas'],
    },
    {
      title: 'Daycare',
      description: 'Daytime care and socialization for your dog while you work. A safe, fun environment for social play.',
      price: 'From $45/day',
      pricingDetails: [
        'Standard Rate: $45/day',
        'Holiday Rate: $62/day',
        'Additional Dog: +$34/day', 
        'Puppy Rate: $56/day'
      ],
      icon: Heart,
      features: ['Social play groups', 'Indoor/outdoor activities', 'Supervised playtime', 'Rest periods', 'Feeding included', 'Individual attention', 'Daily report cards', 'Safe environment'],
    },
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      text: 'Beautiful Souls Boarding has been a lifesaver! The AI booking system made it so easy to schedule daycare for Luna. The care is exceptional!',
      rating: 5,
    },
    {
      name: 'Mike R.',
      text: 'Professional service and great care for our dog Max. The boarding facility is clean and the staff is wonderful.',
      rating: 5,
    },
    {
      name: 'Jennifer L.',
      text: 'Love how easy it is to book through the chat assistant. Buddy always comes home happy after daycare!',
      rating: 5,
    },
  ];

  return (
    <>
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Beautiful Souls Boarding
              <span className="text-blue-600"> - Professional Dog Care</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Book trusted dog boarding and daycare services with our AI-powered 
              scheduling assistant. Your furry friend deserves the best care in Toronto.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link href="/book-with-assistant">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Book with AI Assistant
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/services">
                  View Services & Pricing
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional dog care services tailored to your pet's needs and your schedule.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-semibold text-blue-600 mb-4">
                      {service.price}
                    </div>
                    
                    {/* Pricing Details */}
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-sm text-blue-900 mb-2">Pricing Details:</h4>
                      <ul className="space-y-1">
                        {service.pricingDetails.map((detail, detailIndex) => (
                          <li key={detailIndex} className="text-xs text-blue-800">
                            • {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Features */}
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">What's Included:</h4>
                    <ul className="space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Beautiful Souls Boarding?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Booking</h3>
              <p className="text-gray-600">
                Chat with our smart assistant to find and book the perfect time slots for your dog's needs.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Trusted & Secure</h3>
              <p className="text-gray-600">
                Licensed, insured, and fully vaccinated staff. Your pet's safety is our top priority.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Flexible Scheduling</h3>
              <p className="text-gray-600">
                Real-time availability checking and easy online booking that fits your busy schedule.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Pet Parents Say
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">"{testimonial.text}"</p>
                  <p className="font-semibold">- {testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Book Your Dog's Care?
          </h2>
                      <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join hundreds of happy pet parents in Toronto who trust Beautiful Souls Boarding for their dog care needs.
            </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/book-with-assistant">
                <MessageCircle className="mr-2 h-5 w-5" />
                Start Booking Now
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-blue-600">
              <Link href="/availability">
                Check Availability
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <PawPrint className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold">Beautiful Souls Boarding</span>
              </div>
              <p className="text-gray-400">
                Professional dog care services in Toronto. Your pet's happiness is our mission.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/services" className="hover:text-white transition-colors">Dog Boarding</Link></li>
                <li><Link href="/services" className="hover:text-white transition-colors">Daycare</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/book-with-assistant" className="hover:text-white transition-colors">Book with AI</Link></li>
                <li><Link href="/availability" className="hover:text-white transition-colors">Check Availability</Link></li>
                <li><Link href="/portal" className="hover:text-white transition-colors">Client Portal</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>123 Dog Street, Toronto, ON</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>(647) 986-4106</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>BeautifulSoulsPetBoarding@hotmail.com</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Beautiful Souls Boarding. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
