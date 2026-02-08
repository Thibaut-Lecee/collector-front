'use client';

import { useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Settings from '@/components/settings-layout/Settings';

export default function ProfilePage() {
  const { status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      void signIn('zitadel', { callbackUrl: '/' });
    }
  }, [status]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading your session…</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-6 py-12">
        <Settings />
      </main>
      <Footer />
    </div>
  );
}
