/**
 * Product card component with selection support
 */

import { Check } from 'lucide-react';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onToggle: (productId: string) => void;
  disabled?: boolean;
}

export const ProductCard = ({ product, isSelected, onToggle, disabled }: ProductCardProps) => {
  const imageUrl = Array.isArray(product.IMAGE_URL) 
    ? product.IMAGE_URL[0] 
    : product.IMAGE_URL;

  return (
    <div
      onClick={() => !disabled && onToggle(product.ITEM_ID)}
      className={`
        relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-200
        ${isSelected 
          ? 'border-purple-500 ring-2 ring-purple-500/50' 
          : 'border-gray-700 hover:border-gray-500'
        }
        ${disabled && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 z-10 bg-purple-500 rounded-full p-1">
          <Check size={16} className="text-white" />
        </div>
      )}

      {/* Product image */}
      <div className="aspect-square bg-gray-800 overflow-hidden">
        <img
          src={imageUrl}
          alt={product.ITEM_NAME}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=No+Image';
          }}
        />
      </div>

      {/* Product info */}
      <div className="p-3 bg-gray-800">
        <h3 className="text-sm font-medium text-white truncate" title={product.ITEM_NAME}>
          {product.ITEM_NAME}
        </h3>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-400">{product.PRIMARY_CATEGORY}</span>
          <span className="text-sm font-semibold text-purple-400">${product.PRICE}</span>
        </div>
        <div className="flex gap-1 mt-2">
          <span className="text-xs px-2 py-0.5 bg-gray-700 rounded-full text-gray-300">
            {product.COLOR}
          </span>
        </div>
      </div>
    </div>
  );
};
