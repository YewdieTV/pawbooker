import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    console.log('=== Auth Debug Start ===');
    console.log('Email to test:', email);
    console.log('Auth options configured:', !!authOptions);
    console.log('Email provider configured:', authOptions.providers.length > 0);
    
    // Check if the email provider has our custom function
    const emailProvider = authOptions.providers.find(p => p.id === 'email');
    console.log('Email provider found:', !!emailProvider);
    console.log('Custom send function:', !!(emailProvider as any)?.sendVerificationRequest);
    
    return NextResponse.json({
      success: true,
      debug: {
        email,
        hasAuthOptions: !!authOptions,
        providersCount: authOptions.providers.length,
        hasEmailProvider: !!emailProvider,
        hasCustomSender: !!(emailProvider as any)?.sendVerificationRequest,
      }
    });
    
  } catch (error) {
    console.error('Auth debug error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
