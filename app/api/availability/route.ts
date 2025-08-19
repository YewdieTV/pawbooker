import { NextRequest, NextResponse } from 'next/server';
import { getOpenIntervals } from '@/lib/availability';
import { AvailabilityQuerySchema } from '@/lib/validations';
import { parseISO } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      serviceId: searchParams.get('serviceId'),
      from: searchParams.get('from'),
      to: searchParams.get('to'),
    };

    const validatedParams = AvailabilityQuerySchema.parse(queryParams);
    
    const intervals = await getOpenIntervals({
      serviceId: validatedParams.serviceId,
      from: parseISO(validatedParams.from),
      to: parseISO(validatedParams.to),
    });

    return NextResponse.json({
      success: true,
      intervals: intervals.map(interval => ({
        start: interval.start.toISOString(),
        end: interval.end.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Availability API error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
