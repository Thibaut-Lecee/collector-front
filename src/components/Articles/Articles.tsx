'use client';

import React from 'react';
import { cn } from '@heroui/react';

import ArticleListItem from './Article-list-item';

type ArticleGridProps = React.HTMLAttributes<HTMLDivElement> & {
  itemClassName?: string;
  articles: Array<React.ComponentProps<typeof ArticleListItem>>;
};

const ArticleGrid = React.forwardRef<HTMLDivElement, ArticleGridProps>(
  ({ itemClassName, className, articles, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
          className,
        )}
        {...props}
      >
        {articles.map((article) => (
          <ArticleListItem
            key={article.id}
            removeWrapper
            {...article}
            className={cn('w-full snap-start', itemClassName)}
          />
        ))}
      </div>
    );
  },
);

ArticleGrid.displayName = 'ArticleGrid';

export default ArticleGrid;
