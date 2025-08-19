import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { SignInForm } from '@/components/auth/signin-form';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PawPrint } from 'lucide-react';

interface SignInPageProps {
  searchParams: {
    callbackUrl?: string;
    error?: string;
  };
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect(searchParams.callbackUrl || '/portal');
  }

  return (
    <>
      <Navigation />
      
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <PawPrint className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="mt-4 text-3xl font-bold text-gray-900">
              Sign in to PawBooker
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Access your bookings and manage your pet care services
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Welcome back</CardTitle>
              <CardDescription>
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SignInForm 
                callbackUrl={searchParams.callbackUrl}
                error={searchParams.error}
              />
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account? Sign up with your email above and we'll create one for you.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
