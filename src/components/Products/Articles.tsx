'use client';

import React from 'react';
import { cn } from '@heroui/react';

import ProductListItem from './Article-list-item';

type ProductGridProps = React.HTMLAttributes<HTMLDivElement> & {
  itemClassName?: string;
  products: Array<React.ComponentProps<typeof ProductListItem>>;
};

const ArticleGrid = React.forwardRef<HTMLDivElement, ProductGridProps>(
  ({ itemClassName, className, products, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
          className,
        )}
        {...props}
      >
        {products.map((product) => (
          <ProductListItem
            key={product.id}
            removeWrapper
            {...product}
            className={cn('w-full snap-start', itemClassName)}
          />
        ))}
      </div>
    );
  },
);

ArticleGrid.displayName = 'ArticleGrid';

export default ArticleGrid;
