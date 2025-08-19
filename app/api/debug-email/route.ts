import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: NextRequest) {
  try {
    console.log('Debug Email Test:');
    console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Set' : 'Missing');
    console.log('FROM_EMAIL:', process.env.FROM_EMAIL);
    
    // Test email send
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev', // Use Resend's test domain
      to: 'chatgbttwitchemote@gmail.com', // Must use the verified email for testing
      subject: 'Test Email from Beautiful Souls Boarding',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Email Test Successful!</h2>
          <p>This is a test email to verify Resend is working correctly.</p>
          <p>Time sent: ${new Date().toISOString()}</p>
        </div>
      `,
    });

    console.log('Email send result:', result);

    return NextResponse.json({
      success: true,
      result,
      config: {
        hasResendKey: !!process.env.RESEND_API_KEY,
        fromEmail: process.env.FROM_EMAIL,
      }
    });
    
  } catch (error) {
    console.error('Email test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      config: {
        hasResendKey: !!process.env.RESEND_API_KEY,
        fromEmail: process.env.FROM_EMAIL,
      }
    }, { status: 500 });
  }
}
