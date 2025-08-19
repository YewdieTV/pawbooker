import { prisma } from './prisma';
import { 
  addMinutes, 
  format, 
  isAfter, 
  isBefore, 
  parseISO, 
  startOfDay, 
  endOfDay,
  getDay,
  isWithinInterval,
  eachDayOfInterval,
  setHours,
  setMinutes,
  isSameDay,
  min,
  max,
  addDays
} from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

export interface TimeInterval {
  start: Date;
  end: Date;
}

export interface AvailabilityOptions {
  serviceId: string;
  from: Date;
  to: Date;
}

export interface BookingDraft {
  serviceId: string;
  startDateTime: Date;
  endDateTime: Date;
  clientId: string;
  petId: string;
  priceCents: number;
  notes?: string;
}

const TIMEZONE = 'America/Toronto';

/**
 * Convert time string (HH:mm) to Date object for a specific day
 */
function timeStringToDate(timeStr: string, date: Date): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return setMinutes(setHours(date, hours), minutes);
}

/**
 * Check if a time interval overlaps with another interval
 */
function intervalsOverlap(a: TimeInterval, b: TimeInterval): boolean {
  return isBefore(a.start, b.end) && isAfter(a.end, b.start);
}

/**
 * Merge overlapping intervals and sort them
 */
function mergeIntervals(intervals: TimeInterval[]): TimeInterval[] {
  if (intervals.length === 0) return [];
  
  const sorted = intervals.sort((a, b) => a.start.getTime() - b.start.getTime());
  const merged: TimeInterval[] = [sorted[0]];
  
  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];
    
    if (current.start <= last.end) {
      last.end = max([last.end, current.end]);
    } else {
      merged.push(current);
    }
  }
  
  return merged;
}

/**
 * Get blocked time intervals from existing bookings
 */
async function getBookingBlocks(serviceId: string, from: Date, to: Date): Promise<TimeInterval[]> {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });
  
  if (!service) {
    throw new Error('Service not found');
  }

  // Get all confirmed and held bookings for this service in the time range
  const bookings = await prisma.booking.findMany({
    where: {
      serviceId,
      status: {
        in: ['CONFIRMED', 'HELD']
      },
      OR: [
        {
          startDateTime: {
            gte: from,
            lte: to,
          },
        },
        {
          endDateTime: {
            gte: from,
            lte: to,
          },
        },
        {
          AND: [
            { startDateTime: { lte: from } },
            { endDateTime: { gte: to } },
          ],
        },
      ],
    },
    orderBy: {
      startDateTime: 'asc',
    },
  });

  // Group bookings by time slots to check capacity
  const timeSlots = new Map<string, typeof bookings>();
  
  bookings.forEach(booking => {
    const key = `${booking.startDateTime.toISOString()}-${booking.endDateTime.toISOString()}`;
    if (!timeSlots.has(key)) {
      timeSlots.set(key, []);
    }
    timeSlots.get(key)!.push(booking);
  });

  // Find slots that exceed capacity
  const blockedIntervals: TimeInterval[] = [];
  
  timeSlots.forEach((slotBookings, key) => {
    if (slotBookings.length >= service.capacity) {
      const booking = slotBookings[0];
      blockedIntervals.push({
        start: addMinutes(booking.startDateTime, -service.bufferMins),
        end: addMinutes(booking.endDateTime, service.bufferMins),
      });
    }
  });

  return mergeIntervals(blockedIntervals);
}

/**
 * Get blocked time intervals from blackout dates
 */
async function getBlackoutBlocks(from: Date, to: Date): Promise<TimeInterval[]> {
  const blackouts = await prisma.blackout.findMany({
    where: {
      OR: [
        {
          startDate: {
            gte: from,
            lte: to,
          },
        },
        {
          endDate: {
            gte: from,
            lte: to,
          },
        },
        {
          AND: [
            { startDate: { lte: from } },
            { endDate: { gte: to } },
          ],
        },
      ],
    },
  });

  return blackouts.map(blackout => ({
    start: blackout.startDate,
    end: blackout.endDate,
  }));
}

/**
 * Get available time intervals based on availability rules
 */
async function getAvailabilityRuleIntervals(from: Date, to: Date): Promise<TimeInterval[]> {
  const rules = await prisma.availabilityRule.findMany({
    where: { enabled: true },
  });

  if (rules.length === 0) {
    return [];
  }

  const intervals: TimeInterval[] = [];
  const days = eachDayOfInterval({ start: from, end: to });

  days.forEach(day => {
    const dayOfWeek = getDay(day);
    const rule = rules.find(r => r.dayOfWeek === dayOfWeek);
    
    if (rule) {
      const startTime = timeStringToDate(rule.startTime, day);
      const endTime = timeStringToDate(rule.endTime, day);
      
      // Convert to UTC for consistent handling
      const start = fromZonedTime(startTime, TIMEZONE);
      const end = fromZonedTime(endTime, TIMEZONE);
      
      intervals.push({ start, end });
    }
  });

  return intervals;
}

/**
 * Subtract blocked intervals from available intervals
 */
function subtractIntervals(available: TimeInterval[], blocked: TimeInterval[]): TimeInterval[] {
  if (blocked.length === 0) return available;
  
  let result: TimeInterval[] = [];
  
  available.forEach(availInterval => {
    let current = [availInterval];
    
    blocked.forEach(blockInterval => {
      const next: TimeInterval[] = [];
      
      current.forEach(interval => {
        if (!intervalsOverlap(interval, blockInterval)) {
          next.push(interval);
        } else {
          // Split the interval around the blocked part
          if (isBefore(interval.start, blockInterval.start)) {
            next.push({
              start: interval.start,
              end: min([interval.end, blockInterval.start]),
            });
          }
          
          if (isAfter(interval.end, blockInterval.end)) {
            next.push({
              start: max([interval.start, blockInterval.end]),
              end: interval.end,
            });
          }
        }
      });
      
      current = next;
    });
    
    result = result.concat(current);
  });
  
  return result.filter(interval => isAfter(interval.end, interval.start));
}

/**
 * Get all open time intervals for a service within a date range
 */
export async function getOpenIntervals(options: AvailabilityOptions): Promise<TimeInterval[]> {
  const { serviceId, from, to } = options;
  
  // Get base availability from rules
  const availableIntervals = await getAvailabilityRuleIntervals(from, to);
  
  // Get blocked intervals from bookings and blackouts
  const [bookingBlocks, blackoutBlocks] = await Promise.all([
    getBookingBlocks(serviceId, from, to),
    getBlackoutBlocks(from, to),
  ]);
  
  const allBlocks = mergeIntervals([...bookingBlocks, ...blackoutBlocks]);
  
  // Subtract blocked intervals from available intervals
  return subtractIntervals(availableIntervals, allBlocks);
}

/**
 * Find the first available slot of a given duration starting from a specific time
 */
export async function getFirstOpenSlot(
  serviceId: string,
  durationMins: number,
  from: Date = new Date()
): Promise<Date | null> {
  // Look ahead 30 days maximum
  const to = addDays(from, 30);
  const openIntervals = await getOpenIntervals({ serviceId, from, to });
  
  for (const interval of openIntervals) {
    const slotEnd = addMinutes(interval.start, durationMins);
    if (isBefore(slotEnd, interval.end) || slotEnd.getTime() === interval.end.getTime()) {
      return interval.start;
    }
  }
  
  return null;
}

/**
 * Create a temporary hold on a booking slot
 */
export async function holdSlot(draft: BookingDraft): Promise<string> {
  // Check if slot is still available
  const openIntervals = await getOpenIntervals({
    serviceId: draft.serviceId,
    from: draft.startDateTime,
    to: draft.endDateTime,
  });
  
  const isSlotAvailable = openIntervals.some(interval =>
    (isBefore(interval.start, draft.startDateTime) || interval.start.getTime() === draft.startDateTime.getTime()) &&
    (isAfter(interval.end, draft.endDateTime) || interval.end.getTime() === draft.endDateTime.getTime())
  );
  
  if (!isSlotAvailable) {
    throw new Error('Slot is no longer available');
  }
  
  // Create a held booking with 15-minute expiry
  const holdExpiresAt = addMinutes(new Date(), 15);
  
  const booking = await prisma.booking.create({
    data: {
      ...draft,
      status: 'HELD',
      holdExpiresAt,
    },
  });
  
  return booking.id;
}

/**
 * Confirm a held booking
 */
export async function confirmHeldBooking(bookingId: string): Promise<void> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });
  
  if (!booking) {
    throw new Error('Booking not found');
  }
  
  if (booking.status !== 'HELD') {
    throw new Error('Booking is not in held status');
  }
  
  if (booking.holdExpiresAt && isAfter(new Date(), booking.holdExpiresAt)) {
    throw new Error('Hold has expired');
  }
  
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'CONFIRMED',
      holdExpiresAt: null,
    },
  });
}

/**
 * Clean up expired holds (should be run periodically)
 */
export async function cleanupExpiredHolds(): Promise<void> {
  await prisma.booking.deleteMany({
    where: {
      status: 'HELD',
      holdExpiresAt: {
        lte: new Date(),
      },
    },
  });
}
