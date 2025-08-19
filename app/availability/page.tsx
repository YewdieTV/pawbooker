import { Navigation } from '@/components/navigation';
import { AvailabilityCalendar } from '@/components/availability-calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/prisma';
import { Calendar, MessageCircle, Clock, Info } from 'lucide-react';
import Link from 'next/link';

async function getServices() {
  try {
    const services = await prisma.service.findMany({
      where: { enabled: true },
      orderBy: { type: 'asc' },
    });
    
    return services.map(service => ({
      id: service.id,
      name: service.name,
      type: service.type,
      capacity: service.capacity,
    }));
  } catch (error) {
    console.error('Failed to fetch services:', error);
    return [];
  }
}

export default async function AvailabilityPage() {
  const services = await getServices();

  return (
    <>
      <Navigation />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Check Availability
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              View real-time availability for all our dog care services. Green dates show available time slots.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Calendar */}
            <div className="lg:col-span-3">
              {services.length > 0 ? (
                <AvailabilityCalendar services={services} />
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Services Temporarily Unavailable
                    </h3>
                    <p className="text-gray-600 mb-4">
                      We're currently updating our services. Please check back soon or contact us directly.
                    </p>
                    <Button asChild>
                      <Link href="/book-with-assistant">Contact AI Assistant</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                  <CardDescription>
                    Get help with your booking
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full">
                    <Link href="/book-with-assistant">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Book with AI Assistant
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/services">
                      View All Services
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* How to Book */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Info className="h-5 w-5 mr-2" />
                    How to Book
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-blue-600">1</span>
                      </div>
                      <p>Select a service and check the calendar for available dates</p>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-blue-600">2</span>
                      </div>
                      <p>Click on a green date to see available time slots</p>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-blue-600">3</span>
                      </div>
                      <p>Use our AI assistant for personalized booking help</p>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-blue-600">4</span>
                      </div>
                      <p>Complete booking with secure payment</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Service Hours */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Service Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monday - Friday:</span>
                    <span className="font-medium">8:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saturday:</span>
                    <span className="font-medium">9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sunday:</span>
                    <span className="font-medium">Closed*</span>
                  </div>
                  <p className="text-xs text-gray-500 pt-2 border-t">
                    *Boarding pickup/drop-off available by appointment
                  </p>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  <p className="text-gray-600">
                    Our AI assistant is the fastest way to book, but you can also contact us directly:
                  </p>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Phone:</span>
                      <br />
                      <span className="text-gray-600">(416) 555-0123</span>
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>
                      <br />
                      <span className="text-gray-600">hello@pawbooker.com</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
