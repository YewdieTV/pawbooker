import { NextRequest, NextResponse } from 'next/server';
import { getServiceInfo } from '@/lib/ai/tools';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    // Simple test: if user asks about services, return them directly
    if (message.toLowerCase().includes('services') || message.toLowerCase().includes('prices')) {
      const serviceInfo = await getServiceInfo({});
      
      if (serviceInfo.success && serviceInfo.data) {
        const services = serviceInfo.data.services;
        const response = `We offer these services at Beautiful Souls Boarding:

🏠 **Overnight Boarding** - $${services[0].basePrice}/night
${services[0].description}

🌅 **Daycare** - $${services[1].basePrice}/day  
${services[1].description}

Additional pricing options include holiday rates, multi-dog discounts, puppy rates, and extended stay discounts. Would you like more details about any of these services?`;

        return NextResponse.json({
          success: true,
          message: response,
          conversationId: 'test-conversation',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Hello! I'm Melissa from Beautiful Souls Boarding. I can help you with our dog boarding and daycare services. What would you like to know?",
      conversationId: 'test-conversation',
    });

  } catch (error) {
    console.error('Test AI error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
