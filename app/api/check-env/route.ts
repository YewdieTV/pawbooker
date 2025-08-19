import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    FROM_EMAIL: process.env.FROM_EMAIL,
    RESEND_API_KEY: process.env.RESEND_API_KEY ? 'Set' : 'Missing',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NODE_ENV: process.env.NODE_ENV,
  });
}
