/**
 * React Query hooks for product data
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import { productApi } from '../api';

export const useProducts = (params?: {
  category?: string;
  color?: string;
  min_price?: number;
  max_price?: number;
}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productApi.getProducts(params),
  });
};

export const useSearchProducts = () => {
  return useMutation({
    mutationFn: (query: string) => productApi.searchProducts(query),
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: productApi.getCategories,
  });
};

export const useColors = () => {
  return useQuery({
    queryKey: ['colors'],
    queryFn: productApi.getColors,
  });
};

export const usePriceRange = () => {
  return useQuery({
    queryKey: ['priceRange'],
    queryFn: productApi.getPriceRange,
  });
};
