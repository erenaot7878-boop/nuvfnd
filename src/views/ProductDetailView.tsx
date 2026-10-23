import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Plus, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';

interface ProductDetailViewProps {
  product: Product;
  allProducts: Product[];
  onBack: () => void;
  onSelectProduct: (handle: string) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  allProducts,
  onBack,
  onSelectProduct,
}) => {
  const { addToCart, setIsCartOpen } = useCart();
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [qty, setQty] = useState(1);

  const [openAccordion, setOpenAccordion] = useState<string | null>('details');
  const [isMainImageLoaded, setIsMainImageLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMainImageLoaded(true), 250);
    return () => clearTimeout(timer);
  }, [product.id]);

  const toggleAccordion = (name: string) => {
    setOpenAccordion((prev) => (prev === name ? null : name));
  };

  const variants = product.variants.edges.map((e) => e.node);
  const currentVariant = variants[selectedVariantIdx] || variants[0];
  const primaryImage = product.images.edges[0]?.node?.url;

  // Filter out dummy/default titles
  const isDefaultVariant =
    !currentVariant ||
    currentVariant.title.toLowerCase().includes('default title') ||
    variants.length <= 1;

  // Clean dose string without "Default Title"
  const doseString = isDefaultVariant
    ? (variants[0]?.title && !variants[0]?.title.toLowerCase().includes('default title') ? variants[0].title : '')
    : currentVariant?.title || '';

  // Product descriptions state only: product name, form, dose
  const factualDescription = doseString
    ? `${product.title}, ${product.productType}, ${doseString}.`
    : `${product.title}, ${product.productType}.`;

  const handleAddToCart = () => {
    if (!currentVariant) return;

    addToCart(
      {
        variantId: currentVariant.id,
        productHandle: product.handle,
        productTitle: product.title,
        variantTitle: isDefaultVariant ? '' : currentVariant.title,
        price: currentVariant.price.amount,
        currencyCode: currentVariant.price.currencyCode || 'USD',
        imageUrl: primaryImage,
        productType: product.productType,
      },
      qty,
      { suppressToast: true }
    );

    // Open cart drawer immediately
    setIsCartOpen(true);
  };

  const currentPrice = Number(currentVariant?.price.amount || 0).toFixed(2);

  // Related products: 4 products from same category, excluding current product. If fewer than 4 exist, fill from others.
  const relatedProducts = useMemo(() => {
    const sameCategory = allProducts.filter(
      (p) =>
        p.id !== product.id &&
        (p.productType.toLowerCase() === product.productType.toLowerCase() ||
          p.tags.some((t) => product.tags.includes(t)))
    );

    if (sameCategory.length >= 4) {
      return sameCategory.slice(0, 4);
    }

    const otherProducts = allProducts.filter(
      (p) => p.id !== product.id && !sameCategory.some((sc) => sc.id === p.id)
    );

    return [...sameCategory, ...otherProducts].slice(0, 4);
  }, [allProducts, product]);

  return (
    <div className="pt-4 w-full max-w-[1280px] mx-auto px-4 min-[360px]:px-5 lg:px-10 space-y-12">
      {/* Back Link */}
      <button
        onClick={onBack}
        className="text-[14px] text-[#666666] hover:text-[#111111] transition-colors cursor-pointer flex items-center gap-2"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        <span>Back to shop</span>
      </button>

      {/* 2-Column Layout on Desktop, Stacked on Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* Left Column: Image on 1:1 #F5F5F5 tile, max height 560px, sticky on desktop */}
        <div className="w-full md:sticky md:top-24">
          <div className="w-full aspect-square max-h-[560px] bg-[#F5F5F5] flex items-center justify-center p-[10%] overflow-hidden">
            {primaryImage ? (
              <img
                src={primaryImage}
                alt={product.title}
                onLoad={() => setIsMainImageLoaded(true)}
                className={`w-full h-full max-h-[560px] object-contain mix-blend-multiply select-none transition-opacity duration-[250ms] ease-[var(--ease-out)] ${
                  isMainImageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ) : (
              <span className="text-[14px] text-[#666666]">
                {product.productType || 'Compound'}
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Ordered details */}
        <div className="space-y-6">
          {/* 1. Product Name: 32px, weight 500 */}
          <h1 className="text-[32px] font-medium tracking-tight text-[#111111] leading-tight font-['Jost']">
            {product.title}
          </h1>

          {/* 2. Price: 22px with 150ms cross-fade on variant change */}
          <div key={currentPrice} className="animate-fade-150 text-[22px] font-medium text-[#111111] tabular-nums">
            ${currentPrice}
          </div>

          {/* 3. One plain description line: facts only */}
          <p className="text-[14px] leading-relaxed text-[#666666]">
            {factualDescription}
          </p>

          {/* 4. Dose buttons: large selectable buttons (min 44px) only if several variants and not Default Title */}
          {!isDefaultVariant && variants.length > 1 && (
            <div className="space-y-2 pt-2">
              <span className="text-[14px] text-[#111111] font-medium block">
                Select dose
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {variants.map((v, idx) => {
                  const isSelected = selectedVariantIdx === idx;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantIdx(idx)}
                      className={`min-h-[44px] px-4 py-2.5 border text-left flex items-center justify-between text-[14px] transition-colors duration-[150ms] active:scale-[0.98] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] ${
                        isSelected
                          ? 'border-[#111111] bg-[#111111] text-white font-medium'
                          : 'border-[#E6E6E6] text-[#111111] hover:border-[#111111] bg-white'
                      }`}
                    >
                      <span className="truncate pr-2">{v.title}</span>
                      <span className="tabular-nums shrink-0">
                        ${Number(v.price.amount).toFixed(2)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. Quantity stepper and "Add to bag" button on one row */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              {/* Stepper */}
              <div className="w-[112px] h-[48px] border border-[#CFCFCF] flex items-center justify-between px-3 text-[#111111] shrink-0">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-8 h-full flex items-center justify-center text-[#111111] hover:text-[#666666] transition-colors duration-[150ms] cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} strokeWidth={1.5} />
                </button>
                <span className="text-[14px] font-normal tabular-nums select-none">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty(qty + 1)}
                  className="w-8 h-full flex items-center justify-center text-[#111111] hover:text-[#666666] transition-colors duration-[150ms] cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} strokeWidth={1.5} />
                </button>
              </div>

              {/* Primary "Add to bag" button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="btn-primary flex-1 h-[48px] text-[13px] font-medium cursor-pointer flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
              >
                Add to bag
              </button>
            </div>

            {/* Exact grey 13px line: "Prescription required. A clinician reviews your intake before your order is filled." */}
            <p className="text-[13px] text-[#666666]">
              Prescription required. A clinician reviews your intake before your order is filled.
            </p>
          </div>

          {/* Details accordion with 250ms grid-template-rows transition and 180deg rotating chevron */}
          <div className="border-t border-[#E6E6E6] pt-4">
            <div className="py-2">
              <button
                type="button"
                onClick={() => toggleAccordion('details')}
                className="w-full flex items-center justify-between text-left text-[15px] font-medium text-[#111111] cursor-pointer py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
              >
                <span>Details</span>
                <ChevronDown
                  size={18}
                  strokeWidth={1.5}
                  className={`transition-transform duration-[250ms] ease-[var(--ease-in-out)] ${
                    openAccordion === 'details' ? 'rotate-180' : 'rotate-0'
                  }`}
                />
              </button>
              <div
                className={`grid transition-[grid-template-rows] duration-[250ms] ease-[var(--ease-in-out)] ${
                  openAccordion === 'details' ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="pt-3 pb-2 text-[14px] text-[#666666] leading-relaxed space-y-1.5">
                    <div>
                      <strong className="text-[#111111] font-medium">Form: </strong>
                      <span>{product.productType}</span>
                    </div>
                    <div>
                      <strong className="text-[#111111] font-medium">Dose: </strong>
                      <span>{doseString || product.productType}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RELATED PRODUCTS SECTION: 96px space (mt-24), "You may also like" (22px, weight 500) */}
      {relatedProducts.length > 0 && (
        <section className="pt-24 border-t border-[#E6E6E6]">
          <h2 className="text-[22px] font-medium text-[#111111] mb-6">
            You may also like
          </h2>

          {/* Desktop: minmax(0, 1fr) 4 columns. Mobile: horizontal scroll row with scroll-snap and 44vw card width */}
          <div className="hidden sm:grid sm:grid-cols-[repeat(2,minmax(0,1fr))] lg:grid-cols-[repeat(4,minmax(0,1fr))] sm:gap-x-[20px] lg:gap-x-[24px] sm:gap-y-[28px] lg:gap-y-[32px] items-stretch">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onSelect={onSelectProduct}
              />
            ))}
          </div>

          {/* Mobile scroll-snap row: 44vw card width */}
          <div className="sm:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-4 min-[360px]:-mx-5 px-4 min-[360px]:px-5">
            {relatedProducts.map((p) => (
              <div key={p.id} className="shrink-0 w-[44vw] snap-start flex flex-col">
                <ProductCard
                  product={p}
                  onSelect={onSelectProduct}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* MOBILE STICKY BOTTOM BAR (md:hidden) */}
      <div
        data-sticky-add-bar="true"
        className="fixed bottom-0 left-0 right-0 z-30 bg-[#FFFFFF] border-t border-[#E6E6E6] p-4 flex items-center justify-between md:hidden shadow-sm"
      >
        <div>
          <div className="text-[18px] font-medium text-[#111111] tabular-nums">
            ${currentPrice}
          </div>
          {!isDefaultVariant && (
            <div className="text-[12px] text-[#666666] truncate max-w-[160px]">
              {doseString}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className="h-11 px-6 bg-[#111111] text-white text-[13px] uppercase tracking-[0.04em] font-medium cursor-pointer"
        >
          Add to bag
        </button>
      </div>
    </div>
  );
};
