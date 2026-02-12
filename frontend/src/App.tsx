/**
 * Smart Product Styler - Main App Component
 */

import { useState, useMemo } from 'react';
import { Sparkles, Package } from 'lucide-react';
import {
  Disclaimer,
  CategoryFilter,
  ProductGrid,
  SelectedProducts,
  StylePresets,
  GeneratedImage,
} from './components';
import { useProducts, useGenerateStyle, useRegenerate } from './hooks';
import type { Product, StylingPlan } from './types';

function App() {
  // Filter state
  const [category, setCategory] = useState('');
  const [color, setColor] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Styling state
  const [mood, setMood] = useState('cozy');
  const [style, setStyle] = useState('modern');
  const [colorTheme, setColorTheme] = useState('neutral');
  const [roomType, setRoomType] = useState('living room');
  const [modelQuality, setModelQuality] = useState<'fast' | 'high'>('fast');

  // Generated image state
  const [generatedImage, setGeneratedImage] = useState<string | undefined>();
  const [stylingPlan, setStylingPlan] = useState<StylingPlan | undefined>();
  const [skippedProducts, setSkippedProducts] = useState<string[]>([]);
  const [generationError, setGenerationError] = useState<string | undefined>();

  // Queries and mutations
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({
    category: category || undefined,
    color: color || undefined,
    min_price: minPrice > 0 ? minPrice : undefined,
    max_price: maxPrice < 500 ? maxPrice : undefined,
  });

  const generateMutation = useGenerateStyle();
  const regenerateMutation = useRegenerate();

  // Get selected products
  const selectedProducts = useMemo(() => {
    if (!productsData?.products) return [];
    return productsData.products.filter((p) => selectedIds.has(p.ITEM_ID));
  }, [productsData?.products, selectedIds]);

  // Toggle product selection
  const handleToggleProduct = (productId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else if (next.size < 4) {
        next.add(productId);
      }
      return next;
    });
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  // Clear filters
  const handleClearFilters = () => {
    setCategory('');
    setColor('');
    setMinPrice(0);
    setMaxPrice(500);
  };

  // Generate styled image
  const handleGenerate = async () => {
    if (selectedIds.size === 0) return;

    setGenerationError(undefined);
    setGeneratedImage(undefined);

    try {
      const result = await generateMutation.mutateAsync({
        product_ids: Array.from(selectedIds),
        mood,
        style,
        color_theme: colorTheme,
        room_type: roomType,
        model_quality: modelQuality,
      });

      if (result.success && result.image_base64) {
        setGeneratedImage(result.image_base64);
        setStylingPlan(result.styling_plan);
        setSkippedProducts(result.skipped_products || []);
      } else {
        setGenerationError(result.error || 'Failed to generate image');
      }
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // Regenerate with feedback
  const handleRegenerate = async (feedback: string) => {
    if (!stylingPlan) return;

    setGenerationError(undefined);

    try {
      const result = await regenerateMutation.mutateAsync({
        product_ids: Array.from(selectedIds),
        previous_plan: stylingPlan,
        feedback,
        model_quality: modelQuality,
      });

      if (result.success && result.image_base64) {
        setGeneratedImage(result.image_base64);
        setStylingPlan(result.styling_plan);
        setSkippedProducts(result.skipped_products || []);
      } else {
        setGenerationError(result.error || 'Failed to regenerate image');
      }
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles size={32} className="text-purple-500" />
            <div>
              <h1 className="text-2xl font-bold">Smart Product Styler</h1>
              <p className="text-sm text-gray-400">AI-powered interior design visualization</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Package size={16} />
            <span>Powered by Google Vertex AI</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Disclaimer */}
        <Disclaimer />

        {/* Section 1: Filters */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
            Filter Products
          </h2>
          <CategoryFilter
            selectedCategory={category}
            selectedColor={color}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onCategoryChange={setCategory}
            onColorChange={setColor}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
            onClear={handleClearFilters}
          />
        </section>

        {/* Section 2: Product Selection */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
            Select Products (max 4)
          </h2>
          
          {/* Selected products panel */}
          <div className="mb-4">
            <SelectedProducts
              products={selectedProducts}
              onRemove={handleToggleProduct}
              onClear={handleClearSelection}
            />
          </div>

          {/* Product grid */}
          <ProductGrid
            products={productsData?.products || []}
            selectedIds={selectedIds}
            onToggleProduct={handleToggleProduct}
            isLoading={isLoadingProducts}
            maxSelection={4}
          />
        </section>

        {/* Section 3: Styling Options */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
            Choose Styling Options
          </h2>
          <StylePresets
            mood={mood}
            style={style}
            colorTheme={colorTheme}
            roomType={roomType}
            modelQuality={modelQuality}
            onMoodChange={setMood}
            onStyleChange={setStyle}
            onColorThemeChange={setColorTheme}
            onRoomTypeChange={setRoomType}
            onModelQualityChange={setModelQuality}
          />

          {/* Generate button */}
          <div className="mt-4">
            <button
              onClick={handleGenerate}
              disabled={selectedIds.size === 0 || generateMutation.isPending}
              className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Sparkles size={20} />
              {generateMutation.isPending ? 'Generating...' : 'Generate Styled Image'}
            </button>
            {selectedIds.size === 0 && (
              <p className="text-sm text-gray-500 mt-2">Select at least one product to generate</p>
            )}
          </div>
        </section>

        {/* Section 4: Generated Image */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">4</span>
            Generated Image
          </h2>
          <GeneratedImage
            imageBase64={generatedImage}
            stylingPlan={stylingPlan}
            isLoading={generateMutation.isPending}
            error={generationError}
            skippedProducts={skippedProducts}
            onRegenerate={handleRegenerate}
            isRegenerating={regenerateMutation.isPending}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 py-4 px-6 mt-8">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-400">
          <p>Smart Product Styler MVP • Built with Google Vertex AI, ADK, and Gemini</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
