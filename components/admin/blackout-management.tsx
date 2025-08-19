'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, isAfter, isBefore, startOfDay } from 'date-fns';
import { Calendar, Clock, Trash2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Blackout {
  id: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  description?: string | null;
  createdAt: Date;
}

interface BlackoutManagementProps {
  blackouts: Blackout[];
}

export function BlackoutManagement({ blackouts }: BlackoutManagementProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const today = startOfDay(new Date());
  
  // Separate active, upcoming, and past blackouts
  const activeBlackouts = blackouts.filter(blackout => 
    isBefore(blackout.startDate, today) && isAfter(blackout.endDate, today)
  );
  
  const upcomingBlackouts = blackouts.filter(blackout => 
    isAfter(blackout.startDate, today)
  );
  
  const pastBlackouts = blackouts.filter(blackout => 
    isBefore(blackout.endDate, today)
  );

  const handleDelete = async (blackoutId: string) => {
    if (!confirm('Are you sure you want to delete this blackout period? This will make those dates available again.')) {
      return;
    }

    setDeletingId(blackoutId);
    
    try {
      const response = await fetch(`/api/admin/blackouts/${blackoutId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        router.refresh();
      } else {
        alert('Failed to delete blackout period. Please try again.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete blackout period. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const BlackoutCard = ({ blackout, status }: { blackout: Blackout; status: 'active' | 'upcoming' | 'past' }) => {
    const isDeleting = deletingId === blackout.id;
    
    return (
      <Card key={blackout.id} className={`${status === 'active' ? 'border-red-200 bg-red-50' : ''}`}>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-gray-900">{blackout.reason}</h3>
                <Badge variant={status === 'active' ? 'destructive' : status === 'upcoming' ? 'default' : 'secondary'}>
                  {status}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(blackout.startDate), 'MMM d, yyyy')} - {format(new Date(blackout.endDate), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
              
              {blackout.description && (
                <p className="text-sm text-gray-600 mb-3">{blackout.description}</p>
              )}
              
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>Created {format(new Date(blackout.createdAt), 'MMM d, yyyy')}</span>
              </div>
            </div>
            
            {status !== 'past' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(blackout.id)}
                disabled={isDeleting}
                className="ml-4 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                {isDeleting ? (
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </div>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (blackouts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Blackout Periods</h3>
          <p className="text-gray-600">All dates are currently available for booking.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Active Blackouts */}
      {activeBlackouts.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900">Active Blackouts</h2>
            <Badge variant="destructive">{activeBlackouts.length}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeBlackouts.map(blackout => (
              <BlackoutCard key={blackout.id} blackout={blackout} status="active" />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Blackouts */}
      {upcomingBlackouts.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Blackouts</h2>
            <Badge variant="default">{upcomingBlackouts.length}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingBlackouts.map(blackout => (
              <BlackoutCard key={blackout.id} blackout={blackout} status="upcoming" />
            ))}
          </div>
        </div>
      )}

      {/* Past Blackouts */}
      {pastBlackouts.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="h-5 w-5 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900">Past Blackouts</h2>
            <Badge variant="secondary">{pastBlackouts.length}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastBlackouts.slice(0, 6).map(blackout => (
              <BlackoutCard key={blackout.id} blackout={blackout} status="past" />
            ))}
          </div>
          {pastBlackouts.length > 6 && (
            <p className="text-sm text-gray-500 text-center mt-4">
              Showing 6 of {pastBlackouts.length} past blackouts
            </p>
          )}
        </div>
      )}
    </div>
  );
}
