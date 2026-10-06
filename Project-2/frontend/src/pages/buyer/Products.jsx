import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import productApi from '../../services/product.api';
import ProductGrid from '../../components/product/ProductGrid';
import ProductFilters from '../../components/product/ProductFilters';
import Pagination from '../../components/common/Pagination';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = {
    page: Number(searchParams.get('page')) || 1,
    limit: 12,
    categoryId: searchParams.get('categoryId') || undefined,
    status: searchParams.get('status') || undefined,
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productApi.getProducts(filters),
  });

  const items = data?.data?.data?.items || [];
  const pagination = data?.data?.data?.pagination || {};

  const handleFilterChange = (newFilters) => {
    const params = new URLSearchParams();
    if (newFilters.page && newFilters.page > 1) params.set('page', newFilters.page);
    if (newFilters.categoryId) params.set('categoryId', newFilters.categoryId);
    if (newFilters.status) params.set('status', newFilters.status);
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Products</h1>

      <div className="flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-56 flex-shrink-0">
          <ProductFilters filters={filters} onFilterChange={handleFilterChange} />
        </aside>

        <div className="flex-1">
          {isLoading ? (
            <Loading />
          ) : error ? (
            <ErrorMessage message="Failed to load products" onRetry={refetch} />
          ) : (
            <>
              <ProductGrid products={items} />
              <Pagination
                page={pagination.page || 1}
                totalPages={pagination.totalPages || 1}
                onPageChange={(p) => handleFilterChange({ ...filters, page: p })}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
