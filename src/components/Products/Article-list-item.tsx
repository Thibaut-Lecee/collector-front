'use client';

import React from 'react';
import { Button } from '@heroui/react';
import { cn } from '@heroui/react';

type ProductItem = {
  id: string;
  title: string;
  price: number;
  description?: string;
  userId?: string;
};

type ProductListItemProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'id'> & {
  isPopular?: boolean;
  removeWrapper?: boolean;
} & ProductItem;

const ArticleListItem = React.forwardRef<HTMLDivElement, ProductListItemProps>(
  (
    { title: name, price, description, removeWrapper, className, ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-large bg-content1 shadow-medium relative flex w-64 max-w-full flex-none scroll-ml-6 flex-col gap-3 p-4',
          {
            'rounded-none bg-transparent shadow-none': removeWrapper,
          },
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            'rounded-medium bg-content2 relative flex h-52 max-h-full w-full flex-col items-center justify-center overflow-visible',
          )}
        >
          <div className={cn('flex flex-col gap-2 px-4 pt-6')}>
            <h3 className="text-default-800 text-xl font-semibold tracking-tight">
              {name}
            </h3>
            <p className="text-small text-default-500">{description}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 px-1">
          <div className={cn('flex items-center justify-between')}>
            <h3 className="text-medium text-default-700 font-medium">{name}</h3>
            <p className="text-medium text-default-500 font-medium">${price}</p>
          </div>
          {description ? (
            <p className="text-small text-default-500">{description}</p>
          ) : null}

          <div className="flex gap-2">
            <Button
              fullWidth
              className="font-medium"
              isDisabled
              color="primary"
              radius="lg"
              variant={'solid'}
            >
              Voir le produit
            </Button>
          </div>
        </div>
      </div>
    );
  },
);

ArticleListItem.displayName = 'ArticleListItem';

export default ArticleListItem;
