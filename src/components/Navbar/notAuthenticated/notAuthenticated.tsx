import { Button, NavbarContent, NavbarItem } from '@heroui/react';
import { useRouter } from 'next/navigation';

export default function NotAuthenticatedNavbar() {
  const router = useRouter();
  return (
    <NavbarContent justify="end">
      <NavbarItem className="ml-2 flex! gap-2">
        <Button
          onPress={() => router.push('/auth/login')}
          className="bg-default-100 text-default-700 sm:text-default-500 sm:bg-transparent"
          radius="full"
          variant="light"
        >
          Login
        </Button>
      </NavbarItem>
    </NavbarContent>
  );
}
