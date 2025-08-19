import { addDays, addHours, subHours } from 'date-fns';
import { getOpenIntervals, getFirstOpenSlot } from '@/lib/availability';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    service: {
      findUnique: jest.fn(),
    },
    booking: {
      findMany: jest.fn(),
    },
    blackout: {
      findMany: jest.fn(),
    },
    availabilityRule: {
      findMany: jest.fn(),
    },
  },
}));

const { prisma } = require('@/lib/prisma');

describe('Availability Engine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOpenIntervals', () => {
    it('should return empty array when no availability rules exist', async () => {
      prisma.service.findUnique.mockResolvedValue({
        id: 'service-1',
        capacity: 3,
        bufferMins: 30,
      });
      
      prisma.booking.findMany.mockResolvedValue([]);
      prisma.blackout.findMany.mockResolvedValue([]);
      prisma.availabilityRule.findMany.mockResolvedValue([]);

      const from = new Date('2024-01-01T00:00:00Z');
      const to = new Date('2024-01-02T00:00:00Z');

      const intervals = await getOpenIntervals({
        serviceId: 'service-1',
        from,
        to,
      });

      expect(intervals).toEqual([]);
    });

    it('should return intervals when availability rules exist', async () => {
      prisma.service.findUnique.mockResolvedValue({
        id: 'service-1',
        capacity: 3,
        bufferMins: 30,
      });
      
      prisma.booking.findMany.mockResolvedValue([]);
      prisma.blackout.findMany.mockResolvedValue([]);
      prisma.availabilityRule.findMany.mockResolvedValue([
        {
          dayOfWeek: 1, // Monday
          startTime: '09:00',
          endTime: '17:00',
          enabled: true,
        },
      ]);

      const from = new Date('2024-01-01T00:00:00Z'); // Monday
      const to = new Date('2024-01-02T00:00:00Z');

      const intervals = await getOpenIntervals({
        serviceId: 'service-1',
        from,
        to,
      });

      expect(intervals.length).toBeGreaterThan(0);
    });

    it('should exclude blocked intervals from availability', async () => {
      const startTime = new Date('2024-01-01T10:00:00Z');
      const endTime = new Date('2024-01-01T11:00:00Z');

      prisma.service.findUnique.mockResolvedValue({
        id: 'service-1',
        capacity: 1,
        bufferMins: 30,
      });
      
      prisma.booking.findMany.mockResolvedValue([
        {
          startDateTime: startTime,
          endDateTime: endTime,
          status: 'CONFIRMED',
        },
      ]);
      
      prisma.blackout.findMany.mockResolvedValue([]);
      prisma.availabilityRule.findMany.mockResolvedValue([
        {
          dayOfWeek: 1, // Monday
          startTime: '09:00',
          endTime: '17:00',
          enabled: true,
        },
      ]);

      const from = new Date('2024-01-01T00:00:00Z');
      const to = new Date('2024-01-02T00:00:00Z');

      const intervals = await getOpenIntervals({
        serviceId: 'service-1',
        from,
        to,
      });

      // Should have intervals but not during the booked time
      const hasBlockedTime = intervals.some(interval => 
        interval.start <= startTime && interval.end >= endTime
      );
      
      expect(hasBlockedTime).toBe(false);
    });
  });

  describe('getFirstOpenSlot', () => {
    it('should return null when no slots available', async () => {
      prisma.service.findUnique.mockResolvedValue({
        id: 'service-1',
        capacity: 3,
        bufferMins: 30,
      });
      
      prisma.booking.findMany.mockResolvedValue([]);
      prisma.blackout.findMany.mockResolvedValue([]);
      prisma.availabilityRule.findMany.mockResolvedValue([]);

      const result = await getFirstOpenSlot('service-1', 60);
      expect(result).toBeNull();
    });

    it('should return first available slot when available', async () => {
      prisma.service.findUnique.mockResolvedValue({
        id: 'service-1',
        capacity: 3,
        bufferMins: 30,
      });
      
      prisma.booking.findMany.mockResolvedValue([]);
      prisma.blackout.findMany.mockResolvedValue([]);
      prisma.availabilityRule.findMany.mockResolvedValue([
        {
          dayOfWeek: 1, // Monday
          startTime: '09:00',
          endTime: '17:00',
          enabled: true,
        },
      ]);

      const from = new Date('2024-01-01T00:00:00Z'); // Monday
      const result = await getFirstOpenSlot('service-1', 60, from);
      
      expect(result).toBeInstanceOf(Date);
    });
  });
});
