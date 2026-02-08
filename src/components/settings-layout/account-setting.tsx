'use client';

import * as React from 'react';
import { Input, Spacer } from '@heroui/react';
import { cn } from '@heroui/react';

interface AccountSettingCardProps {
  className?: string;
  email?: string;
  roles?: string[];
  fullName?: string;
}

const AccountSetting = React.forwardRef<
  HTMLDivElement,
  AccountSettingCardProps
>(({ className, email, roles, fullName, ...props }, ref) => (
  <div ref={ref} className={cn('p-2', className)} {...props}>
    <div>
      <p className="text-default-400 mt-1 text-sm font-normal">
        Name to be used for emails.
      </p>
      <Input className="mt-2" placeholder={fullName} readOnly />
    </div>

    <Spacer y={2} />
    <div>
      <p className="text-default-400 mt-1 text-sm font-normal">
        The email address associated with your account.
      </p>
      <Input className="mt-2" placeholder={email} readOnly />
    </div>
    <Spacer y={2} />
    <div>
      <p className="text-default-400 mt-1 text-sm font-normal">
        Your roles in the current project.
      </p>
      <Input
        className="mt-2"
        placeholder={roles?.length ? roles.join(', ') : 'No roles assigned'}
        readOnly
      />
    </div>
  </div>
));

AccountSetting.displayName = 'AccountSetting';

export default AccountSetting;
