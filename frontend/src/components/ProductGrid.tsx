/**
 * Product grid with multi-select capability
 */

import { ProductCard } from './ProductCard';
import { LoadingSpinner } from './LoadingSpinner';
import type { Product } from '../types';

interface ProductGridProps {
  products: Product[];
  selectedIds: Set<string>;
  onToggleProduct: (productId: string) => void;
  isLoading?: boolean;
  maxSelection?: number;
}

export const ProductGrid = ({
  products,
  selectedIds,
  onToggleProduct,
  isLoading,
  maxSelection = 4,
}: ProductGridProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner text="Loading products..." />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No products found matching your filters.</p>
        <p className="text-sm mt-1">Try adjusting your filter criteria.</p>
      </div>
    );
  }

  const isMaxSelected = selectedIds.size >= maxSelection;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.ITEM_ID}
          product={product}
          isSelected={selectedIds.has(product.ITEM_ID)}
          onToggle={onToggleProduct}
          disabled={isMaxSelected && !selectedIds.has(product.ITEM_ID)}
        />
      ))}
    </div>
  );
};
