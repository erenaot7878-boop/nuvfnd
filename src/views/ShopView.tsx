import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { Product } from '../types';
import { ProductCard, ProductCardSkeleton } from '../components/ProductCard';

interface ShopViewProps {
  products: Product[];
  types: string[];
  tags: string[];
  isLoading: boolean;
  selectedType: string;
  selectedTag: string;
  searchQuery: string;
  onSelectType: (type: string) => void;
  onSelectTag: (tag: string) => void;
  onSearchChange: (query: string) => void;
  onSelectProduct: (handle: string) => void;
  onQuickView?: (product: Product) => void;
  onClearFilters: () => void;
  isWishlistFilter?: boolean;
}

export const ShopView: React.FC<ShopViewProps> = ({
  products,
  isLoading,
  selectedType,
  selectedTag,
  searchQuery,
  onSelectType,
  onSelectTag,
  onSelectProduct,
  onClearFilters,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedForms, setSelectedForms] = useState<string[]>(() =>
    selectedType ? [selectedType] : []
  );
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name-asc'>('featured');
  const [visibleCount, setVisibleCount] = useState<number>(12);

  const filterBtnRef = useRef<HTMLButtonElement>(null);
  const filterPanelRef = useRef<HTMLDivElement>(null);

  // Filter change transition state (fades to 0.4 over 100ms, then fades in over 250ms)
  const [isFilterFading, setIsFilterFading] = useState(false);
  const prevFilterKey = useRef('');
  const currentFilterKey = `${searchQuery}-${selectedTag}-${selectedForms.join(',')}-${selectedType}-${sortBy}`;

  useEffect(() => {
    if (prevFilterKey.current && prevFilterKey.current !== currentFilterKey) {
      setIsFilterFading(true);
      const timer = setTimeout(() => setIsFilterFading(false), 100);
      return () => clearTimeout(timer);
    }
    prevFilterKey.current = currentFilterKey;
  }, [currentFilterKey]);

  // Lock body & html scroll when filter panel is open
  useEffect(() => {
    if (isFilterOpen) {
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyOverflow = document.body.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      filterPanelRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsFilterOpen(false);
          filterBtnRef.current?.focus();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.overflow = originalBodyOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isFilterOpen]);

  // Category tabs: All, Weight loss, Peptides, Men's health, Hair loss
  const categories = [
    { label: 'All', tag: '' },
    { label: 'Weight loss', tag: 'weight-loss' },
    { label: 'Peptides', tag: 'peptides' },
    { label: "Men's health", tag: 'mens-health' },
    { label: 'Hair loss', tag: 'hair-loss' },
  ];

  const formOptions = ['Injectable', 'Oral', 'Topical', 'Nasal spray'];

  // Handle form checkbox toggle inside the filter panel
  const handleToggleForm = (form: string) => {
    setSelectedForms((prev) =>
      prev.includes(form) ? prev.filter((f) => f !== form) : [...prev, form]
    );
  };

  const handleApplyFilter = () => {
    if (selectedForms.length === 1) {
      onSelectType(selectedForms[0]);
    } else {
      onSelectType('');
    }
    setIsFilterOpen(false);
    filterBtnRef.current?.focus();
  };

  const handleClearFilterPanel = () => {
    setSelectedForms([]);
    onSelectType('');
    onClearFilters();
    setIsFilterOpen(false);
    filterBtnRef.current?.focus();
  };

  // Filter calculation
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.productType.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Category tag
    if (selectedTag) {
      result = result.filter((p) => p.tags.includes(selectedTag));
    }

    // Form filter (from selectedForms if applied or selectedType)
    if (selectedForms.length > 0) {
      result = result.filter((p) =>
        selectedForms.some(
          (form) => p.productType.toLowerCase() === form.toLowerCase()
        )
      );
    } else if (selectedType) {
      result = result.filter(
        (p) => p.productType.toLowerCase() === selectedType.toLowerCase()
      );
    }

    // Sort
    if (sortBy === 'price-asc') {
      result.sort(
        (a, b) =>
          Number(a.priceRange.minVariantPrice.amount) -
          Number(b.priceRange.minVariantPrice.amount)
      );
    } else if (sortBy === 'price-desc') {
      result.sort(
        (a, b) =>
          Number(b.priceRange.minVariantPrice.amount) -
          Number(a.priceRange.minVariantPrice.amount)
      );
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      result.sort((a, b) => {
        const aFeat = a.tags.includes('featured') ? 1 : 0;
        const bFeat = b.tags.includes('featured') ? 1 : 0;
        return bFeat - aFeat;
      });
    }

    return result;
  }, [products, searchQuery, selectedTag, selectedForms, selectedType, sortBy]);

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const hasMore = visibleCount < filteredProducts.length;

  return (
    <div className="pt-4 w-full max-w-[1280px] mx-auto px-4 min-[360px]:px-5 lg:px-10 space-y-8">
      {/* Page Title: "Shop" at 32px weight 500 + one small grey line under it */}
      <div className="space-y-1">
        <h1 className="text-[32px] font-medium text-[#111111] tracking-tight font-['Jost']">
          Shop
        </h1>
        <p className="text-[14px] text-[#666666]">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
        </p>
      </div>

      {/* Category Tabs: Single row of simple text tabs, selected one has 2px underline */}
      <div className="border-b border-[#E6E6E6] overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-4 min-[360px]:-mx-5 lg:-mx-10 px-4 min-[360px]:px-5 lg:px-10">
        <div className="flex gap-8 whitespace-nowrap min-w-max">
          {categories.map((cat) => {
            const isSelected = selectedTag === cat.tag;
            return (
              <button
                key={cat.label}
                type="button"
                onClick={() => onSelectTag(cat.tag)}
                className={`pb-3 text-[15px] font-medium transition-colors duration-[150ms] cursor-pointer relative ${
                  isSelected
                    ? 'text-[#111111]'
                    : 'text-[#666666] hover:text-[#111111]'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`absolute bottom-0 left-0 right-0 h-[2px] bg-[#111111] origin-left transition-transform duration-[250ms] ease-[var(--ease-out)] ${
                    isSelected ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter button next to sort dropdown in a single row */}
      <div className="flex items-center justify-between gap-4 py-2">
        <button
          ref={filterBtnRef}
          type="button"
          onClick={() => setIsFilterOpen(true)}
          className="btn-secondary h-10 px-4 flex items-center gap-2 text-[14px] font-medium cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
        >
          <SlidersHorizontal size={16} strokeWidth={1.5} />
          <span>Filter</span>
          {selectedForms.length > 0 && (
            <span className="text-[12px] bg-[#111111] text-white rounded-full w-5 h-5 flex items-center justify-center">
              {selectedForms.length}
            </span>
          )}
        </button>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2 text-[14px] text-[#666666]">
          <span className="hidden sm:inline">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-[14px] text-[#111111] bg-transparent border-b border-[#111111] pb-1 cursor-pointer outline-none transition-colors duration-[150ms]"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to high</option>
            <option value="price-desc">Price: High to low</option>
            <option value="name-asc">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Product Grid: min-height prevents layout jump. Fades out to 0.4 over 100ms on filter change, then fades in over 250ms */}
      <div
        className={`min-h-[480px] transition-opacity ${
          isFilterFading
            ? 'opacity-40 duration-[100ms] ease-[var(--ease-out)]'
            : 'opacity-100 duration-[250ms] ease-[var(--ease-out)]'
        }`}
      >
        {isLoading ? (
          <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] min-[600px]:grid-cols-[repeat(3,minmax(0,1fr))] lg:grid-cols-[repeat(4,minmax(0,1fr))] gap-x-[10px] min-[360px]:gap-x-[12px] min-[600px]:gap-x-[20px] lg:gap-x-[24px] gap-y-[28px] lg:gap-y-[32px] items-stretch">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <p className="text-[16px] text-[#666666]">
              No products found.
            </p>
            <button
              type="button"
              onClick={handleClearFilterPanel}
              className="btn-secondary h-[44px] px-8 text-[13px] font-medium cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] min-[600px]:grid-cols-[repeat(3,minmax(0,1fr))] lg:grid-cols-[repeat(4,minmax(0,1fr))] gap-x-[10px] min-[360px]:gap-x-[12px] min-[600px]:gap-x-[20px] lg:gap-x-[24px] gap-y-[28px] lg:gap-y-[32px] items-stretch">
            {displayedProducts.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
                staggerIndex={i < 4 ? i : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* "Show more" button under the grid */}
      {hasMore && (
        <div className="pt-8 text-center">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 12)}
            className="btn-secondary px-8 h-12 text-[13px] font-medium cursor-pointer"
          >
            Show more
          </button>
        </div>
      )}

      {/* FILTER PANEL / BOTTOM SHEET: Rendered with createPortal into document.body.
          Overlay z-[90] covering entire screen, Panel z-[100], tabIndex -1 */}
      {isFilterOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filter products"
            className="fixed inset-0 pointer-events-none"
          >
            {/* Overlay covering full screen including header */}
            <div
              className="fixed inset-0 bg-[#000000]/40 z-[90] pointer-events-auto transition-opacity duration-[250ms] ease-[var(--ease-out)]"
              onClick={() => {
                setIsFilterOpen(false);
                filterBtnRef.current?.focus();
              }}
              aria-hidden="true"
            />

            {/* Panel Container: z-[100] */}
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center sm:justify-end pointer-events-none">
              <div
                ref={filterPanelRef}
                tabIndex={-1}
                className="pointer-events-auto relative w-full sm:max-w-md bg-[#FFFFFF] rounded-t-2xl sm:rounded-t-none sm:rounded-l-2xl sm:h-full max-h-[85vh] sm:max-h-full flex flex-col shadow-2xl overflow-hidden outline-none animate-[pageEnter_350ms_var(--ease-out)_forwards]"
              >
                {/* Header */}
                <div className="px-6 py-5 border-b border-[#E6E6E6] flex items-center justify-between">
                  <h3 className="text-[20px] font-medium text-[#111111]">
                    Filter
                  </h3>
                  <button
                    onClick={() => {
                      setIsFilterOpen(false);
                      filterBtnRef.current?.focus();
                    }}
                    className="w-10 h-10 flex items-center justify-center text-[#111111] hover:text-[#666666] transition-colors duration-[150ms] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
                    aria-label="Close filters"
                  >
                    <X size={20} strokeWidth={1.5} />
                  </button>
                </div>

                {/* Body: Form group */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-[16px] font-medium text-[#111111]">
                      Form
                    </h4>
                    <div className="space-y-3">
                      {formOptions.map((form) => {
                        const isChecked = selectedForms.includes(form);
                        return (
                          <label
                            key={form}
                            className="flex items-center gap-3 cursor-pointer text-[15px] text-[#111111] hover:text-[#666666] transition-colors duration-[150ms]"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleForm(form)}
                              className="w-4 h-4 accent-[#111111] cursor-pointer"
                            />
                            <span>{form}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer: Clear link and Apply button */}
                <div className="p-6 border-t border-[#E6E6E6] bg-[#FFFFFF] flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={handleClearFilterPanel}
                    className="text-[14px] text-[#666666] hover:text-[#111111] underline underline-offset-4 transition-colors duration-[150ms] cursor-pointer"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyFilter}
                    className="btn-primary px-8 h-11 text-[13px] font-medium cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
