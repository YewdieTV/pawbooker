import { prisma } from '@/lib/prisma';
import { getOpenIntervals, getFirstOpenSlot, holdSlot } from '@/lib/availability';
import { 
  CheckAvailabilitySchema, 
  HoldSlotSchema, 
  CreateBookingFromAISchema 
} from '@/lib/validations';
import { ServiceType } from '@prisma/client';
import { parseISO, addDays, startOfDay, endOfDay, format, addHours } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';

const TIMEZONE = 'America/Toronto';

interface AIToolResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Check availability for a service in a given date range
 */
export async function checkAvailability(params: any): Promise<AIToolResult> {
  try {
    const validated = CheckAvailabilitySchema.parse(params);
    
    // Get service by type
    const service = await prisma.service.findFirst({
      where: { 
        type: validated.serviceType,
        enabled: true,
      },
    });

    if (!service) {
      return {
        success: false,
        error: `Service ${validated.serviceType} not found or not available`,
      };
    }

    const startDate = parseISO(validated.startDate + 'T00:00:00');
    const endDate = validated.endDate 
      ? parseISO(validated.endDate + 'T23:59:59')
      : addDays(startDate, 7); // Default to 7 days if no end date

    const intervals = await getOpenIntervals({
      serviceId: service.id,
      from: fromZonedTime(startDate, TIMEZONE),
      to: fromZonedTime(endDate, TIMEZONE),
    });

    // Convert intervals back to local time and format for AI
    const availableSlots = intervals.map(interval => ({
      start: format(interval.start, 'yyyy-MM-dd HH:mm'),
      end: format(interval.end, 'yyyy-MM-dd HH:mm'),
      date: format(interval.start, 'yyyy-MM-dd'),
      startTime: format(interval.start, 'HH:mm'),
      endTime: format(interval.end, 'HH:mm'),
    }));

    // If duration is specified, find specific slots of that duration
    if (validated.durationHours) {
      const durationMins = validated.durationHours * 60;
      const specificSlots = [];
      
      for (const interval of intervals) {
        let current = interval.start;
        while (current < interval.end) {
          const slotEnd = addHours(current, validated.durationHours);
          if (slotEnd <= interval.end) {
            specificSlots.push({
              start: format(current, 'yyyy-MM-dd HH:mm'),
              end: format(slotEnd, 'yyyy-MM-dd HH:mm'),
              date: format(current, 'yyyy-MM-dd'),
              startTime: format(current, 'HH:mm'),
              duration: `${validated.durationHours} hours`,
            });
          }
          current = addHours(current, 1); // Check every hour
        }
      }
      
      return {
        success: true,
        data: {
          serviceType: validated.serviceType,
          serviceName: service.name,
          basePrice: service.basePriceCents / 100,
          currency: 'CAD',
          availableSlots: specificSlots.slice(0, 10), // Limit to 10 suggestions
          searchPeriod: {
            from: validated.startDate,
            to: validated.endDate || format(endDate, 'yyyy-MM-dd'),
          },
        },
      };
    }

    return {
      success: true,
      data: {
        serviceType: validated.serviceType,
        serviceName: service.name,
        basePrice: service.basePriceCents / 100,
        currency: 'CAD',
        availableIntervals: availableSlots,
        capacity: service.capacity,
        searchPeriod: {
          from: validated.startDate,
          to: validated.endDate || format(endDate, 'yyyy-MM-dd'),
        },
      },
    };
  } catch (error) {
    console.error('Check availability error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check availability',
    };
  }
}

/**
 * Hold a time slot temporarily
 */
export async function holdTimeSlot(params: any, userId?: string): Promise<AIToolResult> {
  try {
    const validated = HoldSlotSchema.parse(params);
    
    if (!userId) {
      return {
        success: false,
        error: 'User must be logged in to hold a time slot',
      };
    }

    // Get service by type
    const service = await prisma.service.findFirst({
      where: { 
        type: validated.serviceType,
        enabled: true,
      },
    });

    if (!service) {
      return {
        success: false,
        error: `Service ${validated.serviceType} not found`,
      };
    }

    // Find or create pet
    let pet = await prisma.pet.findFirst({
      where: {
        ownerId: userId,
        name: validated.petName,
      },
    });

    if (!pet) {
      pet = await prisma.pet.create({
        data: {
          ownerId: userId,
          name: validated.petName,
          notes: 'Created via AI booking assistant',
        },
      });
    }

    // Calculate price
    const startDateTime = parseISO(validated.startDateTime);
    const endDateTime = parseISO(validated.endDateTime);
    
    let priceCents = service.basePriceCents;
    if (service.type === 'BOARDING') {
      const diffTime = endDateTime.getTime() - startDateTime.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      priceCents = service.basePriceCents * diffDays;
    }

    const holdId = await holdSlot({
      serviceId: service.id,
      startDateTime,
      endDateTime,
      clientId: userId,
      petId: pet.id,
      priceCents,
    });

    return {
      success: true,
      data: {
        holdId,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        service: service.name,
        pet: pet.name,
        startDateTime: validated.startDateTime,
        endDateTime: validated.endDateTime,
        price: priceCents / 100,
        currency: 'CAD',
      },
    };
  } catch (error) {
    console.error('Hold time slot error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to hold time slot',
    };
  }
}

/**
 * Get service information
 */
export async function getServiceInfo(params: any): Promise<AIToolResult> {
  try {
    const { serviceType } = params;
    
    if (serviceType) {
      const service = await prisma.service.findFirst({
        where: { 
          type: serviceType,
          enabled: true,
        },
      });

      if (!service) {
        return {
          success: false,
          error: `Service ${serviceType} not found`,
        };
      }

      return {
        success: true,
        data: {
          type: service.type,
          name: service.name,
          description: service.description,
          basePrice: service.basePriceCents / 100,
          currency: 'CAD',
          capacity: service.capacity,
          durationMins: service.durationMins,
          bufferMins: service.bufferMins,
        },
      };
    }

    // Get all services
    const services = await prisma.service.findMany({
      where: { enabled: true },
      orderBy: { type: 'asc' },
    });

    return {
      success: true,
      data: {
        services: services.map(service => ({
          type: service.type,
          name: service.name,
          description: service.description,
          basePrice: service.basePriceCents / 100,
          currency: 'CAD',
          capacity: service.capacity,
          durationMins: service.durationMins,
        })),
      },
    };
  } catch (error) {
    console.error('Get service info error:', error);
    return {
      success: false,
      error: 'Failed to get service information',
    };
  }
}

/**
 * Get business information
 */
export async function getBusinessInfo(): Promise<AIToolResult> {
  try {
    const settings = await prisma.businessSettings.findUnique({
      where: { id: 'singleton' },
    });

    const availabilityRules = await prisma.availabilityRule.findMany({
      where: { enabled: true },
      orderBy: { dayOfWeek: 'asc' },
    });

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const workingHours = availabilityRules.map(rule => ({
      day: daysOfWeek[rule.dayOfWeek],
      startTime: rule.startTime,
      endTime: rule.endTime,
    }));

    return {
      success: true,
      data: {
        businessName: settings?.businessName || 'PawBooker',
        timezone: settings?.timezone || 'America/Toronto',
        address: settings?.address,
        contactEmail: settings?.contactEmail,
        contactPhone: settings?.contactPhone,
        workingHours,
        depositPercent: settings?.depositPct || 50,
        taxRate: (settings?.taxRate || 0.13) * 100, // Convert to percentage
      },
    };
  } catch (error) {
    console.error('Get business info error:', error);
    return {
      success: false,
      error: 'Failed to get business information',
    };
  }
}

// Tool definitions for OpenAI function calling
export const AI_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'check_availability',
      description: 'Check availability for a specific service type within a date range',
      parameters: {
        type: 'object',
        properties: {
          serviceType: {
            type: 'string',
            enum: Object.values(ServiceType),
            description: 'Type of service to check availability for',
          },
          startDate: {
            type: 'string',
            pattern: '^\\d{4}-\\d{2}-\\d{2}$',
            description: 'Start date in YYYY-MM-DD format',
          },
          endDate: {
            type: 'string',
            pattern: '^\\d{4}-\\d{2}-\\d{2}$',
            description: 'End date in YYYY-MM-DD format (optional, defaults to 7 days from start)',
          },
          durationHours: {
            type: 'number',
            description: 'Specific duration in hours for fixed-length services (optional)',
          },
        },
        required: ['serviceType', 'startDate'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'hold_time_slot',
      description: 'Hold a specific time slot temporarily (15 minutes) for a user',
      parameters: {
        type: 'object',
        properties: {
          serviceType: {
            type: 'string',
            enum: Object.values(ServiceType),
            description: 'Type of service to book',
          },
          startDateTime: {
            type: 'string',
            description: 'Start date and time in ISO format',
          },
          endDateTime: {
            type: 'string',
            description: 'End date and time in ISO format',
          },
          petName: {
            type: 'string',
            description: 'Name of the pet for the booking',
          },
        },
        required: ['serviceType', 'startDateTime', 'endDateTime', 'petName'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_service_info',
      description: 'Get information about available services',
      parameters: {
        type: 'object',
        properties: {
          serviceType: {
            type: 'string',
            enum: Object.values(ServiceType),
            description: 'Specific service type to get info for (optional)',
          },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_business_info',
      description: 'Get business information including hours, location, and policies',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
] as const;

export async function executeAITool(
  toolName: string, 
  params: any, 
  userId?: string
): Promise<AIToolResult> {
  switch (toolName) {
    case 'check_availability':
      return checkAvailability(params);
    case 'hold_time_slot':
      return holdTimeSlot(params, userId);
    case 'get_service_info':
      return getServiceInfo(params);
    case 'get_business_info':
      return getBusinessInfo();
    default:
      return {
        success: false,
        error: `Unknown tool: ${toolName}`,
      };
  }
}
