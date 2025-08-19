import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    console.log('Auth Debug Test:');
    console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Set' : 'Missing');
    console.log('FROM_EMAIL:', process.env.FROM_EMAIL);
    console.log('Trying to send to:', email);
    
    // Simulate the NextAuth email send
    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: 'Sign in to Beautiful Souls Boarding',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to Beautiful Souls Boarding!</h2>
          <p>Click the link below to sign in to your account:</p>
          <a href="https://beautifulsoulspetboarding.vercel.app/auth/signin" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
            Sign In
          </a>
          <p style="color: #666; font-size: 14px;">
            If you didn't request this email, you can safely ignore it.
          </p>
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
        toEmail: email,
      }
    });
    
  } catch (error) {
    console.error('Auth email test error:', error);
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
