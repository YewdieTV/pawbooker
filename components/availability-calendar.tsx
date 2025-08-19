'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar,
  ChevronLeft, 
  ChevronRight,
  Clock,
  Users,
  AlertCircle
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday, 
  addMonths, 
  subMonths,
  addDays,
  parseISO
} from 'date-fns';
import { cn } from '@/lib/utils';

interface Service {
  id: string;
  name: string;
  type: string;
  capacity: number;
}

interface AvailabilityCalendarProps {
  services: Service[];
  selectedService?: Service;
  onServiceChange?: (service: Service) => void;
  onDateSelect?: (date: Date, intervals: Array<{ start: string; end: string }>) => void;
}

interface DayAvailability {
  date: Date;
  available: boolean;
  intervals: Array<{
    start: string;
    end: string;
  }>;
}

export function AvailabilityCalendar({ 
  services, 
  selectedService, 
  onServiceChange, 
  onDateSelect 
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availability, setAvailability] = useState<Map<string, DayAvailability>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  // Default to first service if none selected
  const activeService = selectedService || services[0];

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Fetch availability for the current month
  useEffect(() => {
    if (!activeService) return;

    const fetchAvailability = async () => {
      setIsLoading(true);
      try {
        const from = format(calendarStart, 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'');
        const to = format(calendarEnd, 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'');
        
        const response = await fetch(
          `/api/availability?serviceId=${activeService.id}&from=${from}&to=${to}`
        );
        
        if (response.ok) {
          const data = await response.json();
          const availabilityMap = new Map<string, DayAvailability>();
          
          // Initialize all days as unavailable
          calendarDays.forEach(day => {
            availabilityMap.set(format(day, 'yyyy-MM-dd'), {
              date: day,
              available: false,
              intervals: [],
            });
          });
          
          // Process available intervals
          if (data.intervals) {
            data.intervals.forEach((interval: { start: string; end: string }) => {
              const startDate = parseISO(interval.start);
              const dayKey = format(startDate, 'yyyy-MM-dd');
              const existing = availabilityMap.get(dayKey);
              
              if (existing) {
                existing.available = true;
                existing.intervals.push({
                  start: format(startDate, 'HH:mm'),
                  end: format(parseISO(interval.end), 'HH:mm'),
                });
              }
            });
          }
          
          setAvailability(availabilityMap);
        }
      } catch (error) {
        console.error('Failed to fetch availability:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailability();
  }, [activeService?.id, currentMonth]);

  const handleDateClick = (date: Date) => {
    const dayKey = format(date, 'yyyy-MM-dd');
    const dayAvailability = availability.get(dayKey);
    
    if (dayAvailability?.available) {
      setSelectedDate(date);
      onDateSelect?.(date, dayAvailability.intervals);
    }
  };

  const getDayStatus = (date: Date) => {
    const dayKey = format(date, 'yyyy-MM-dd');
    const dayAvailability = availability.get(dayKey);
    
    if (!isSameMonth(date, currentMonth)) {
      return 'other-month';
    }
    
    if (dayAvailability?.available) {
      return 'available';
    }
    
    return 'unavailable';
  };

  return (
    <div className="space-y-6">
      {/* Service Selector */}
      {services.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Service</CardTitle>
            <CardDescription>Choose a service to view availability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {services.map((service) => (
                <Button
                  key={service.id}
                  variant={activeService?.id === service.id ? 'default' : 'outline'}
                  onClick={() => onServiceChange?.(service)}
                  className="justify-start h-auto p-4"
                >
                  <div className="text-left">
                    <div className="font-semibold">{service.name}</div>
                    <div className="text-xs opacity-70 flex items-center mt-1">
                      <Users className="h-3 w-3 mr-1" />
                      Capacity: {service.capacity}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Availability Calendar</span>
              </CardTitle>
              <CardDescription>
                {activeService && `Showing availability for ${activeService.name}`}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="font-semibold min-w-[120px] text-center">
                {format(currentMonth, 'MMMM yyyy')}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Clock className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                <p className="text-sm text-gray-600">Loading availability...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {calendarDays.map((date) => {
                  const status = getDayStatus(date);
                  const isSelected = selectedDate && isSameDay(date, selectedDate);
                  const isCurrentDay = isToday(date);
                  
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => handleDateClick(date)}
                      disabled={status === 'unavailable' || status === 'other-month'}
                      className={cn(
                        'p-2 text-sm rounded-lg transition-colors relative',
                        'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500',
                        {
                          'text-gray-400': status === 'other-month',
                          'text-gray-900 bg-green-50 hover:bg-green-100 border border-green-200': status === 'available',
                          'text-gray-500 bg-gray-50 cursor-not-allowed': status === 'unavailable',
                          'ring-2 ring-blue-500 bg-blue-50': isSelected,
                          'font-bold': isCurrentDay,
                        }
                      )}
                    >
                      <span className={cn({ 'text-blue-600': isCurrentDay })}>
                        {format(date, 'd')}
                      </span>
                      
                      {/* Availability indicator */}
                      {status === 'available' && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="flex items-center justify-center space-x-6 text-xs text-gray-600 pt-4 border-t">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-100 border border-green-200 rounded" />
                  <span>Available</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-gray-100 rounded" />
                  <span>Unavailable</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-100 border border-blue-500 rounded" />
                  <span>Selected</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Selected Date Info */}
      {selectedDate && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Available time slots for {activeService?.name}
              </p>
              
              {(() => {
                const dayKey = format(selectedDate, 'yyyy-MM-dd');
                const dayAvailability = availability.get(dayKey);
                
                if (!dayAvailability?.intervals.length) {
                  return (
                    <div className="flex items-center justify-center text-gray-500 py-4">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <span>No specific time slots available</span>
                    </div>
                  );
                }
                
                return (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {dayAvailability.intervals.map((interval, index) => (
                      <div
                        key={index}
                        className="p-2 bg-green-50 border border-green-200 rounded text-sm"
                      >
                        {interval.start} - {interval.end}
                      </div>
                    ))}
                  </div>
                );
              })()}
              
              <div className="mt-4">
                <Button asChild>
                  <a href="/book-with-assistant">Book This Date</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
