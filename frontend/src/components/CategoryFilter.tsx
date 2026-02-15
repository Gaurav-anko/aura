/**
 * Filter controls for products
 */

import { useCategories, useColors, usePriceRange } from '../hooks';

interface CategoryFilterProps {
  selectedCategory: string;
  selectedColor: string;
  minPrice: number;
  maxPrice: number;
  onCategoryChange: (category: string) => void;
  onColorChange: (color: string) => void;
  onMinPriceChange: (price: number) => void;
  onMaxPriceChange: (price: number) => void;
  onClear: () => void;
}

export const CategoryFilter = ({
  selectedCategory,
  selectedColor,
  minPrice,
  maxPrice,
  onCategoryChange,
  onColorChange,
  onMinPriceChange,
  onMaxPriceChange,
  onClear,
}: CategoryFilterProps) => {
  const { data: categoriesData } = useCategories();
  const { data: colorsData } = useColors();
  const { data: priceRangeData } = usePriceRange();

  const categories = categoriesData?.categories || [];
  const colors = colorsData?.colors || [];
  const priceRange = priceRangeData || { min_price: 0, max_price: 500 };

  // Count active filters
  const activeFiltersCount = 
    (selectedCategory ? 1 : 0) + 
    (selectedColor ? 1 : 0) + 
    ((minPrice > priceRange.min_price || maxPrice < priceRange.max_price) ? 1 : 0);

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">     <div className="flex flex-wrap gap-4 items-end">
        {/* Category filter */}
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Color filter */}
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Color
          </label>
          <select
            value={selectedColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Colors</option>
            {colors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>

        {/* Price range */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price Range: ${minPrice} - ${maxPrice}
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="range"
              min={priceRange.min_price}
              max={priceRange.max_price}
              value={minPrice}
              onChange={(e) => onMinPriceChange(Number(e.target.value))}
              className="flex-1 accent-purple-500"
            />
            <span className="text-gray-400">-</span>
            <input
              type="range"
              min={priceRange.min_price}
              max={priceRange.max_price}
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(Number(e.target.value))}
              className="flex-1 accent-purple-500"
            />
          </div>
        </div>

        {/* Clear button */}
        <button
          onClick={onClear}
          disabled={activeFiltersCount === 0}
          className={`px-4 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
            activeFiltersCount > 0
              ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Clear Filters
          {activeFiltersCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-purple-800 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
