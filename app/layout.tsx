import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Beautiful Souls Boarding - Professional Dog Care Services',
  description: 'Book trusted dog boarding, daycare, walks, and drop-in visits with our AI-powered scheduling assistant.',
  keywords: ['dog boarding', 'dog daycare', 'dog walking', 'pet care', 'Toronto'],
  authors: [{ name: 'Beautiful Souls Boarding' }],
  openGraph: {
    title: 'Beautiful Souls Boarding - Professional Dog Care Services',
    description: 'Book trusted dog boarding, daycare, walks, and drop-in visits with our AI-powered scheduling assistant.',
    type: 'website',
    locale: 'en_CA',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
