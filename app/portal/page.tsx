import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/prisma';
import { 
  Calendar, 
  PawPrint, 
  Clock, 
  MapPin, 
  Phone,
  Plus,
  CreditCard,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

async function getUserBookings(userId: string) {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        clientId: userId,
      },
      include: {
        service: true,
        pet: true,
        payments: true,
      },
      orderBy: {
        startDateTime: 'desc',
      },
    });

    return bookings;
  } catch (error) {
    console.error('Failed to fetch user bookings:', error);
    return [];
  }
}

async function getUserPets(userId: string) {
  try {
    const pets = await prisma.pet.findMany({
      where: {
        ownerId: userId,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return pets;
  } catch (error) {
    console.error('Failed to fetch user pets:', error);
    return [];
  }
}

export default async function ClientPortalPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/api/auth/signin?callbackUrl=/portal');
  }

  const [bookings, pets] = await Promise.all([
    getUserBookings(session.user.id),
    getUserPets(session.user.id),
  ]);

  const upcomingBookings = bookings.filter(
    booking => booking.startDateTime > new Date() && booking.status !== 'CANCELED'
  );

  const pastBookings = bookings.filter(
    booking => booking.startDateTime <= new Date() || booking.status === 'CANCELED'
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PENDING':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'CANCELED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'PENDING':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'CANCELED':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <>
      <Navigation />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {session.user.name || 'Pet Parent'}!
            </h1>
            <p className="text-lg text-gray-600">
              Manage your bookings and pet information
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button asChild>
                      <Link href="/book-with-assistant">
                        <Plus className="h-4 w-4 mr-2" />
                        Book New Service
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/availability">
                        <Calendar className="h-4 w-4 mr-2" />
                        Check Availability
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Upcoming Bookings
                  </CardTitle>
                  <CardDescription>
                    Your scheduled appointments and services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingBookings.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No upcoming bookings
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Book a service to get started
                      </p>
                      <Button asChild>
                        <Link href="/book-with-assistant">Book Now</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-semibold">{booking.service.name}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                                  {getStatusIcon(booking.status)}
                                  <span className="ml-1">{booking.status}</span>
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <PawPrint className="h-4 w-4 mr-2" />
                                  <span>{booking.pet.name}</span>
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  <span>
                                    {format(booking.startDateTime, 'MMM d, yyyy')}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-2" />
                                  <span>
                                    {format(booking.startDateTime, 'h:mm a')} - {format(booking.endDateTime, 'h:mm a')}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  <span>{formatCurrency(booking.priceCents)}</span>
                                </div>
                              </div>
                              
                              {booking.notes && (
                                <p className="text-sm text-gray-600 mt-2">
                                  <strong>Notes:</strong> {booking.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Past Bookings */}
              {pastBookings.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Booking History</CardTitle>
                    <CardDescription>
                      Your completed and canceled bookings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pastBookings.slice(0, 5).map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between py-2 border-b last:border-b-0"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{booking.service.name}</span>
                              <span className="text-gray-500">•</span>
                              <span className="text-sm text-gray-600">{booking.pet.name}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                                {booking.status}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {format(booking.startDateTime, 'MMM d, yyyy')}
                            </div>
                          </div>
                          <div className="text-sm font-medium">
                            {formatCurrency(booking.priceCents)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pet Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PawPrint className="h-5 w-5 mr-2" />
                    Your Pets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pets.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-600 mb-3">
                        No pets registered yet
                      </p>
                      <Button asChild size="sm">
                        <Link href="/book-with-assistant">Add Pet via Booking</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pets.map((pet) => (
                        <div key={pet.id} className="p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold">{pet.name}</h4>
                          {pet.breed && (
                            <p className="text-sm text-gray-600">{pet.breed}</p>
                          )}
                          {pet.ageYears && (
                            <p className="text-sm text-gray-600">{pet.ageYears} years old</p>
                          )}
                          {pet.specialCare && (
                            <span className="inline-block mt-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              Special Care
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>(647) 986-4106</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>123 Dog Street, Toronto, ON</span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-gray-600 mb-2">
                      Business Hours:
                    </p>
                    <p>Monday - Sunday: Open 24/7</p>
                    <p className="text-xs text-gray-500 mt-1">Available around the clock for your pet's needs</p>
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
