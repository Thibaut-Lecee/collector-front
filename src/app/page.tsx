'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Input, Pagination } from '@heroui/react';
import { useEffect, useMemo, useState } from 'react';
import ArticleGrid from '@/components/Products/Articles';

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  userId?: string;
};

const ITEMS_PER_PAGE = 8;

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    setFetchError(null);

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/v1/articles/findAll`);

      if (response.status === 204) {
        setProducts([]);
        return;
      }

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const formattedData = data.map((item: Product) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price,
      }));
      setProducts(formattedData);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setFetchError('Impossible de charger les produits pour le moment.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return products;

    return products.filter((product) => {
      return (
        product.title.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    });
  }, [products, searchQuery]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredProducts.slice(start, end);
  }, [currentPage, filteredProducts]);

  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col items-center px-6 py-6">
        <section className="w-full max-w-7xl space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl font-semibold text-default-800">
              Nos produits
            </h1>
            <Input
              className="w-full sm:max-w-sm"
              placeholder="Rechercher un produit..."
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
              onValueChange={setSearchQuery}
              isClearable
            />
          </div>

          <p className="text-sm text-default-500">
            {filteredProducts.length} résultat
            {filteredProducts.length > 1 ? 's' : ''} sur {products.length}{' '}
            produit{products.length > 1 ? 's' : ''}
          </p>

          {isLoading ? (
            <p className="text-default-500">Chargement des produits...</p>
          ) : fetchError ? (
            <p className="text-danger">{fetchError}</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-default-500">
              Aucun produit ne correspond à votre recherche.
            </p>
          ) : (
            <>
              <ArticleGrid products={paginatedProducts} />
              {totalPages > 1 && (
                <div className="flex justify-center py-4">
                  <Pagination
                    page={currentPage}
                    total={totalPages}
                    showControls
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
