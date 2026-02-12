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

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex flex-wrap gap-4 items-end">
        {/* Category filter */}
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Color
          </label>
          <select
            value={selectedColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
          <label className="block text-sm font-medium text-gray-300 mb-1">
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
          className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};
