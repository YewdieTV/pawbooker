import { NextRequest, NextResponse } from 'next/server';
import { checkAvailability } from '@/lib/ai/tools';
import { ServiceType } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    console.log('Simple booking request:', message);
    
    // Determine service type from message
    const lowerMessage = message.toLowerCase();
    let serviceType: ServiceType;
    let serviceName: string;
    
    if (lowerMessage.includes('daycare')) {
      serviceType = ServiceType.DAYCARE;
      serviceName = 'daycare';
    } else if (lowerMessage.includes('boarding')) {
      serviceType = ServiceType.BOARDING;
      serviceName = 'boarding';
    } else {
      return NextResponse.json({
        success: false,
        error: 'Please specify either daycare or boarding service'
      });
    }
    
    // Get today's date
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    
    console.log(`Checking availability for ${serviceName} starting ${startDate}`);
    
    // Check availability
    const availabilityResult = await checkAvailability({
      serviceType,
      startDate,
    });
    
    console.log('Availability result:', availabilityResult);
    
    if (!availabilityResult.success) {
      return NextResponse.json({
        success: false,
        message: `I'm sorry, I'm having trouble checking ${serviceName} availability right now. Please try calling us at (647) 986-4106 or visit our Availability page.`
      });
    }
    
    const { data } = availabilityResult;
    
    if (!data.availableIntervals || data.availableIntervals.length === 0) {
      return NextResponse.json({
        success: true,
        message: `I checked our ${serviceName} availability and unfortunately we don't have any open slots in the next week. Please call us at (647) 986-4106 to discuss other options or check back later.`
      });
    }
    
    // Format the response with available dates
    const availableDates = data.availableIntervals.slice(0, 5).map((slot: any) => {
      const date = new Date(slot.date);
      const dayName = date.toLocaleDateString('en-CA', { weekday: 'long' });
      const formattedDate = date.toLocaleDateString('en-CA', { month: 'long', day: 'numeric' });
      return `• ${dayName}, ${formattedDate} from ${slot.startTime} to ${slot.endTime}`;
    }).join('\n');
    
    const responseMessage = `Great! I found ${serviceName} availability for you. Here are the next available slots:

${availableDates}

Our ${serviceName} is $${data.basePrice}/day. To book any of these slots:
1. Call us at (647) 986-4106, or
2. Visit our Availability page to see the full calendar

Would you like me to help you with anything else about our services?`;
    
    return NextResponse.json({
      success: true,
      message: responseMessage,
      data: {
        serviceType,
        serviceName,
        basePrice: data.basePrice,
        availableSlots: data.availableIntervals.slice(0, 5)
      }
    });
    
  } catch (error) {
    console.error('Simple booking error:', error);
    return NextResponse.json({
      success: false,
      message: "I'm having trouble checking availability right now. Please call us at (647) 986-4106 or visit our Availability page to book directly."
    }, { status: 500 });
  }
}
