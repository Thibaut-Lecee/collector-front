'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Input, Pagination } from '@heroui/react';
import { useEffect, useRef, useState } from 'react';
import ArticleGrid from '@/components/Articles/Articles';

type Article = {
  id: string;
  title: string;
  description: string;
  price: number;
  userId?: string;
};

type PaginatedArticlesResponse = {
  items: Article[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const ITEMS_PER_PAGE = 8;

async function getPaginatedArticles(
  page: number,
  limit: number,
  searchQuery: string = '',
): Promise<PaginatedArticlesResponse> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search: searchQuery,
  });

  // Use a relative path so the app works behind Ingress (collector.local) without
  // baking environment-specific hostnames into the client bundle.
  const response = await fetch(
    `/api/v1/articles/getPaginated?${query.toString()}`,
  );

  if (response.status === 204) {
    return {
      items: [],
      page,
      limit,
      total: 0,
      totalPages: 0,
    };
  }

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const data = (await response.json()) as PaginatedArticlesResponse;

  return {
    ...data,
    items: data.items.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      price: item.price,
    })),
  };
}

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalArticles, setTotalArticles] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const requestIdRef = useRef(0);
  const pageCacheRef = useRef<Map<string, PaginatedArticlesResponse>>(
    new Map(),
  );

  useEffect(() => {
    const requestId = ++requestIdRef.current;

    setIsLoading(true);
    setFetchError(null);

    const normalizedSearchQuery = searchQuery.trim();
    const cacheKey = `${currentPage}:${normalizedSearchQuery}`;
    const cachedPage = pageCacheRef.current.get(cacheKey);
    if (cachedPage) {
      setArticles(cachedPage.items);
      setTotalPages(cachedPage.totalPages);
      setTotalArticles(cachedPage.total);
      setIsLoading(false);
    }

    const load = async () => {
      try {
        const pageData =
          cachedPage ??
          (await getPaginatedArticles(
            currentPage,
            ITEMS_PER_PAGE,
            normalizedSearchQuery,
          ));

        if (requestIdRef.current !== requestId) return;

        if (!cachedPage) pageCacheRef.current.set(cacheKey, pageData);

        if (pageData.totalPages > 0 && currentPage > pageData.totalPages) {
          setCurrentPage(pageData.totalPages);
          return;
        }

        setArticles(pageData.items);
        setTotalPages(pageData.totalPages);
        setTotalArticles(pageData.total);
      } catch (error) {
        if (requestIdRef.current !== requestId) return;

        console.error('Failed to fetch articles:', error);
        setFetchError('Impossible de charger les articles pour le moment.');
        setArticles([]);
        setTotalPages(0);
        setTotalArticles(0);
      } finally {
        if (requestIdRef.current === requestId) {
          setIsLoading(false);
        }
      }
    };

    void load();
  }, [currentPage, searchQuery]);

  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col items-center px-6 py-6">
        <section className="w-full max-w-7xl space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl font-semibold text-default-800">
              Nos articles
            </h1>
            <Input
              className="w-full sm:max-w-sm"
              placeholder="Rechercher un article..."
              startContent={
                <svg
                  className="h-4 w-4 text-default-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 3.5a5.5 5.5 0 104.4 8.8l2.65 2.65a.75.75 0 101.06-1.06l-2.65-2.65A5.5 5.5 0 009 3.5zM5 9a4 4 0 118 0 4 4 0 01-8 0z"
                    clipRule="evenodd"
                  />
                </svg>
              }
              value={searchQuery}
              onValueChange={(value) => {
                pageCacheRef.current.clear();
                setIsLoading(true);
                setFetchError(null);
                setArticles([]);
                setTotalPages(0);
                setTotalArticles(0);
                setSearchQuery(value);
                setCurrentPage(1);
              }}
              isClearable
            />
          </div>

          <p className="text-sm text-default-500">
            {totalPages > 0 ? (
              <>
                Page {currentPage} sur {totalPages} · {totalArticles} article
                {totalArticles > 1 ? 's' : ''}
              </>
            ) : (
              <>
                {totalArticles} article{totalArticles > 1 ? 's' : ''}
              </>
            )}
          </p>

          {isLoading ? (
            <p className="text-default-500">Chargement des articles...</p>
          ) : fetchError ? (
            <p className="text-danger">{fetchError}</p>
          ) : totalArticles === 0 ? (
            <p className="text-default-500">
              {searchQuery.trim()
                ? 'Aucun article ne correspond à votre recherche.'
                : 'Aucun article disponible pour le moment.'}
            </p>
          ) : (
            <>
              <ArticleGrid articles={articles} />
              {totalPages > 1 && (
                <div className="flex flex-col items-center justify-between gap-3 rounded-large bg-content1 px-4 py-3 shadow-small sm:flex-row">
                  <p className="text-small text-default-500">
                    Page {currentPage} sur {totalPages}
                  </p>
                  <Pagination
                    page={currentPage}
                    total={totalPages}
                    siblings={1}
                    boundaries={1}
                    variant="bordered"
                    radius="full"
                    color="primary"
                    showControls
                    showShadow
                    isDisabled={isLoading}
                    classNames={{
                      wrapper: 'gap-1',
                      item: 'min-w-9 h-9 text-small font-medium',
                      cursor: 'min-w-9 h-9',
                      prev: 'min-w-9 h-9',
                      next: 'min-w-9 h-9',
                    }}
                    onChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
