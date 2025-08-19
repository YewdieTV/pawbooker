import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServiceInfo } from '@/lib/ai/tools';

export async function GET() {
  try {
    // Test database connection
    const services = await prisma.service.findMany({
      where: { enabled: true },
    });

    // Test AI tool
    const serviceInfo = await getServiceInfo({});

    return NextResponse.json({
      dbConnection: 'success',
      servicesCount: services.length,
      services: services.map(s => ({
        name: s.name,
        type: s.type,
        price: s.basePriceCents / 100,
        enabled: s.enabled
      })),
      aiToolResult: serviceInfo,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      dbConnection: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
