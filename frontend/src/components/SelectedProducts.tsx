/**
 * Selected products panel with styling options
 */

import { X, Sparkles } from 'lucide-react';
import type { Product } from '../types';

interface SelectedProductsProps {
  products: Product[];
  onRemove: (productId: string) => void;
  onClear: () => void;
}

export const SelectedProducts = ({ products, onRemove, onClear }: SelectedProductsProps) => {
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Sparkles size={20} className="text-purple-400" />
          Selected Products ({products.length}/4)
        </h3>
        <button
          onClick={onClear}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        {products.map((product) => {
          const imageUrl = Array.isArray(product.IMAGE_URL)
            ? product.IMAGE_URL[0]
            : product.IMAGE_URL;

          return (
            <div
              key={product.ITEM_ID}
              className="relative group bg-gray-700 rounded-lg overflow-hidden"
            >
              <div className="w-20 h-20">
                <img
                  src={imageUrl}
                  alt={product.ITEM_NAME}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=No+Image';
                  }}
                />
              </div>
              <button
                onClick={() => onRemove(product.ITEM_ID)}
                className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} className="text-white" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5">
                <p className="text-[10px] text-white truncate">{product.ITEM_NAME}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
