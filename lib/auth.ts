import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import EmailProvider from 'next-auth/providers/email';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from './prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    EmailProvider({
      from: 'onboarding@resend.dev', // Force use of Resend test domain
      sendVerificationRequest: async ({ identifier: email, url }) => {
        console.log('🔍 NextAuth sendVerificationRequest called');
        console.log('📧 Sending to:', email);
        console.log('🔗 Sign-in URL:', url);
        console.log('📤 From email: onboarding@resend.dev');
        
        try {
          const result = await resend.emails.send({
            from: 'onboarding@resend.dev', // Force use of Resend test domain
            to: email,
            subject: 'Sign in to Beautiful Souls Boarding',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Welcome to Beautiful Souls Boarding!</h2>
                <p>Click the link below to sign in to your account:</p>
                <a href="${url}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
                  Sign In
                </a>
                <p style="color: #666; font-size: 14px;">
                  If you didn't request this email, you can safely ignore it.
                </p>
                <p style="color: #999; font-size: 12px;">
                  Email ID: ${new Date().toISOString()}
                </p>
              </div>
            `,
          });
          
          console.log('✅ Email sent successfully:', result);
          return result;
        } catch (error) {
          console.error('❌ Failed to send verification email:', error);
          throw error;
        }
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user && token?.sub) {
        session.user.id = token.sub;
        
        // Get user role from database
        const user = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true },
        });
        
        if (user) {
          session.user.role = user.role;
        }
      }
      return session;
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
    error: '/auth/error',
  },
};

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: 'ADMIN' | 'CLIENT';
    };
  }
  
  interface User {
    role?: 'ADMIN' | 'CLIENT';
  }
}
