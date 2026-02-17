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
  console.log('SelectedProducts rendered with products:', products);
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-100 via-purple-50 to-purple-100 border-2 border-purple-300 rounded-xl p-4 shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Sparkles size={20} className="text-purple-600 animate-pulse" />
          Selected Products ({products.length}/4)
        </h3>
        <button
          onClick={onClear}
          className="text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg transition-all"
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
              className="relative group bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200"
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
                className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              >
                <X size={12} className="text-white" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm px-1 py-0.5">
                <p className="text-[10px] text-gray-900 truncate">{product.ITEM_NAME}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
