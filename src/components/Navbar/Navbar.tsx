'use client';

import type { NavbarProps } from '@heroui/react';

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
} from '@heroui/react';
import { AcmeIcon } from '@/icons/acme';
import { useSession } from 'next-auth/react';
import AuthenticatedNavBar from './authenticated/authenticated';
import NotAuthenticatedNavbar from './notAuthenticated/notAuthenticated';

const Navigation = (props: NavbarProps) => {
  const { status } = useSession();

  return (
    <Navbar
      {...props}
      isBordered
      classNames={{ wrapper: 'w-full justify-center bg-transparent' }}
      height="60px"
    >
      <NavbarBrand>
        <div className="bg-foreground text-background rounded-full">
          <AcmeIcon size={34} />
        </div>
        <span className="ml-2 font-medium">Collector-shop</span>
      </NavbarBrand>
      <NavbarContent className="hidden md:flex" justify="center">
        <NavbarItem>
          <Link color="foreground" href="/" size="sm">
            Accueil
          </Link>
        </NavbarItem>
      </NavbarContent>
      {status === 'authenticated' ? (
        <AuthenticatedNavBar />
      ) : (
        <NotAuthenticatedNavbar />
      )}
    </Navbar>
  );
};

export default Navigation;
