'use client';

import AccountSetting from './account-setting';
import { useSession } from 'next-auth/react';
import { decodeJwtPayload, extractZitadelRoles } from '@/lib/jwt';

export default function Settings() {
  const { data: session } = useSession();
  const idPayload = session?.idToken ? decodeJwtPayload(session.idToken) : null;
  const accessPayload = session?.accessToken
    ? decodeJwtPayload(session.accessToken)
    : null;

  const idRoles = extractZitadelRoles(idPayload);
  const rolesFromToken =
    idRoles.length > 0 ? idRoles : extractZitadelRoles(accessPayload);

  const readStringClaim = (claimName: string): string => {
    const idClaim = idPayload?.[claimName];
    if (typeof idClaim === 'string') return idClaim;

    const accessClaim = accessPayload?.[claimName];
    if (typeof accessClaim === 'string') return accessClaim;

    return '';
  };

  const email = readStringClaim('email') || session?.user?.email || '';
  const givenName = readStringClaim('given_name');
  const familyName = readStringClaim('family_name');
  const fullName =
    [givenName, familyName].filter(Boolean).join(' ') ||
    session?.user?.name ||
    '';

  return (
    <div className="w-full max-w-2xl flex-1 p-4 justify-center mx-auto">
      <div className="flex items-center gap-x-3">
        <h1 className="text-default-foreground text-3xl leading-9 font-bold">
          Settings
        </h1>
      </div>
      <h2 className="text-small text-default-500 mt-2">
        Customize settings, email preferences, and web appearance.
      </h2>
      <AccountSetting
        email={email}
        fullName={fullName}
        roles={rolesFromToken}
      />
    </div>
  );
}
