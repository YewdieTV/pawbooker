import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { prisma } from '@/lib/prisma';
import { BlackoutManagement } from '@/components/admin/blackout-management';
import { CalendarX, Plus, AlertCircle } from 'lucide-react';

async function getBlackouts() {
  try {
    const blackouts = await prisma.blackout.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return blackouts;
  } catch (error) {
    console.error('Failed to fetch blackouts:', error);
    return [];
  }
}

export default async function BlackoutsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/signin?callbackUrl=/admin/blackouts');
  }

  const blackouts = await getBlackouts();

  return (
    <>
      <Navigation />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3">
              <CalendarX className="h-8 w-8 text-red-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Blackout Dates</h1>
                <p className="text-gray-600">Manage dates when services are unavailable</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Create New Blackout */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Add Blackout Period</span>
                </CardTitle>
                <CardDescription>
                  Block dates when services should be unavailable
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action="/api/admin/blackouts" method="POST" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        name="endDate"
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="reason">Reason</Label>
                    <Input
                      id="reason"
                      name="reason"
                      placeholder="e.g., Holiday, Maintenance, Fully Booked"
                      required
                    />
                  </div>
                  

                  
                  <Button type="submit" className="w-full">
                    Add Blackout Period
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Usage Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <span>Guidelines</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">When to Use Blackouts:</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• <strong>Holidays:</strong> Christmas, New Year, etc.</li>
                    <li>• <strong>Maintenance:</strong> Facility repairs or cleaning</li>
                    <li>• <strong>Personal Time:</strong> Vacations or time off</li>
                    <li>• <strong>Fully Booked:</strong> When at capacity</li>
                    <li>• <strong>Emergency:</strong> Unexpected closures</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Effects:</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Dates will appear unavailable to customers</li>
                    <li>• Melissa AI won't offer blocked dates</li>
                    <li>• Existing bookings are NOT affected</li>
                    <li>• You can delete blackouts to re-open dates</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Existing Blackouts */}
          <div className="mt-8">
            <BlackoutManagement blackouts={blackouts} />
          </div>
        </div>
      </div>
    </>
  );
}
