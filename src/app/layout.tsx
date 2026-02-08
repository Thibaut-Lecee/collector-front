import './globals.css';
import { Metadata } from 'next';
import { ZitadelProvider } from '@/app/providers';
import type { ReactNode } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  title: 'Collector Front',
  description: 'Frontend application for Collector',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col bg-default-50 text-default-700 dark:bg-default-900 dark:text-default-300">
        <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
          <ZitadelProvider>{children}</ZitadelProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
