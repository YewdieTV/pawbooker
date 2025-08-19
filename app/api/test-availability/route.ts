import { NextRequest, NextResponse } from 'next/server';
import { checkAvailability } from '@/lib/ai/tools';
import { ServiceType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing availability check...');
    
    // Test checking daycare availability for the next 7 days
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    
    const result = await checkAvailability({
      serviceType: ServiceType.DAYCARE,
      startDate: startDate,
    });
    
    console.log('Availability check result:', result);
    
    return NextResponse.json({
      success: true,
      testParams: {
        serviceType: ServiceType.DAYCARE,
        startDate: startDate,
      },
      result: result,
    });
    
  } catch (error) {
    console.error('Availability test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
