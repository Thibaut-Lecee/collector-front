'use client';
import { Button, NavbarContent, NavbarItem } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { decodeJwtPayload, hasZitadelAdminRole } from '@/lib/jwt';

export default function AuthenticatedNavBar() {
  const router = useRouter();
  const { data: session } = useSession();

  const idPayload = session?.idToken ? decodeJwtPayload(session.idToken) : null;
  const accessPayload = session?.accessToken
    ? decodeJwtPayload(session.accessToken)
    : null;
  const isAdmin =
    hasZitadelAdminRole(idPayload) || hasZitadelAdminRole(accessPayload);

  return (
    <NavbarContent justify="end">
      <NavbarItem className="ml-2 flex! gap-2">
        <Button
          onPress={() => router.push('/profile')}
          className="bg-default-100 text-default-700 sm:text-default-500 sm:bg-transparent"
          radius="full"
          variant="light"
        >
          Profile
        </Button>
        {isAdmin && (
          <Button
            onPress={() => router.push('/admin/monitoring')}
            className="bg-default-100 text-default-700 sm:text-default-500 sm:bg-transparent"
            radius="full"
            variant="light"
          >
            Monitoring
          </Button>
        )}
        <form action="/api/auth/logout" method="POST">
          <Button
            type="submit"
            className="bg-default-100 text-default-700 sm:text-default-500 sm:bg-transparent"
            radius="full"
            variant="light"
          >
            Déconnexion
          </Button>
        </form>
      </NavbarItem>
    </NavbarContent>
  );
}
