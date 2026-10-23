import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useScrollReveal } from '../styles/motion';

interface ProductCardProps {
  product: Product;
  onSelect: (handle: string) => void;
  staggerIndex?: number;
}

/**
 * Data cleanup helper used by every card.
 * Normalizes display name, determines single canonical form,
 * formats exact or "From $X" price, and flags option status.
 */
export function formatProductCardData(product: Product) {
  // 1. Display name: remove a leading form word (e.g., "Injectable Semaglutide" -> "Semaglutide")
  let rawTitle = product.title || '';
  if (['Default Title', 'undefined', 'null'].includes(rawTitle)) {
    rawTitle = '';
  }
  const displayName = rawTitle
    .replace(/^(injectable|oral|topical|nasal spray|nasal)\s+/i, '')
    .trim();

  // 2. Product form only: Injectable, Oral, Topical, Nasal spray
  const canonicalForms = ['Injectable', 'Oral', 'Topical', 'Nasal spray'];
  let displayForm = '';
  const rawType = product.productType || '';

  const matchedType = canonicalForms.find(
    (f) => f.toLowerCase() === rawType.toLowerCase()
  );
  if (matchedType) {
    displayForm = matchedType;
  } else if (product.tags && Array.isArray(product.tags)) {
    if (product.tags.includes('injectable')) displayForm = 'Injectable';
    else if (product.tags.includes('oral')) displayForm = 'Oral';
    else if (product.tags.includes('topical')) displayForm = 'Topical';
    else if (
      product.tags.includes('nasal-spray') ||
      product.tags.includes('nasal')
    ) {
      displayForm = 'Nasal spray';
    }
  }

  // Hide if placeholder or invalid
  if (['Default Title', 'undefined', 'null', 'NaN'].includes(displayForm)) {
    displayForm = '';
  }

  // 3. Price: "From $X" if multiple variants with differing prices, else exact price
  const variants = product.variants?.edges?.map((e) => e.node) || [];
  const prices = variants
    .map((v) => Number(v.price?.amount))
    .filter((p) => !isNaN(p) && p > 0);

  const minPrice =
    prices.length > 0
      ? Math.min(...prices)
      : Number(product.priceRange?.minVariantPrice?.amount) || 0;

  const maxPrice = prices.length > 0 ? Math.max(...prices) : minPrice;
  const hasDifferingPrices = prices.length > 1 && maxPrice > minPrice;

  const formattedPrice = hasDifferingPrices
    ? `From $${minPrice.toFixed(2)}`
    : `$${minPrice.toFixed(2)}`;

  return {
    displayName,
    displayForm,
    formattedPrice,
    hasOptions: variants.length > 1,
    primaryVariant: variants[0] || null,
  };
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  staggerIndex,
}) => {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const cardRef = useScrollReveal<HTMLElement>(staggerIndex ?? 0);

  // Fallback so cached images smoothly display without blank delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsImageLoaded(true);
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  const primaryImage = product.images?.edges?.[0]?.node?.url;
  const {
    displayName,
    displayForm,
    formattedPrice,
    hasOptions,
    primaryVariant,
  } = formatProductCardData(product);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasOptions) {
      onSelect(product.handle);
      return;
    }

    if (primaryVariant) {
      addToCart({
        variantId: primaryVariant.id,
        productHandle: product.handle,
        productTitle: product.title,
        variantTitle: primaryVariant.title,
        price: primaryVariant.price.amount,
        currencyCode: primaryVariant.price.currencyCode || 'USD',
        imageUrl: primaryImage,
        productType: product.productType,
      });

      setIsAdded(true);
      setTimeout(() => {
        setIsAdded(false);
      }, 1500);
    }
  };

  const buttonAriaLabel = isAdded
    ? `Added ${displayName} to bag`
    : hasOptions
    ? `Choose dose for ${displayName}`
    : `Add ${displayName} to bag`;

  const staggerClass =
    staggerIndex !== undefined ? `stagger-${Math.min(staggerIndex % 4, 3)}` : '';

  return (
    <article
      ref={cardRef}
      className={`group flex flex-col h-full text-left ${
        staggerIndex !== undefined ? `reveal-block ${staggerClass}` : ''
      }`}
    >
      {/* 1. Image tile: 1:1, #F5F5F5, 8px radius, object-contain, 8% padding, mix-blend-multiply.
          Desktop hover: image scales to 1.03 (400ms --ease-out). Soft pulse until image loads. */}
      <a
        href={`#/product/${product.handle}`}
        onClick={(e) => {
          e.preventDefault();
          onSelect(product.handle);
        }}
        aria-label={displayName}
        className={`block w-full aspect-square bg-[#F5F5F5] rounded-[8px] overflow-hidden p-[8%] relative focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] ${
          !isImageLoaded ? 'animate-soft-pulse' : ''
        }`}
      >
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={displayName}
            loading="lazy"
            onLoad={() => setIsImageLoaded(true)}
            className={`w-full h-full object-contain mix-blend-multiply select-none transition-transform duration-[400ms] ease-[var(--ease-out)] min-[1024px]:group-hover:scale-[1.03] transition-opacity duration-[var(--d-base)] ${
              isImageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[13px] text-[#666666]">
            {displayName}
          </div>
        )}
      </a>

      {/* 2. Info block: name (16px, weight 500, line-height 1.3, max 2 lines, reserves 2.6em min-height), then form line (13px, #666) */}
      <div className="pt-3 flex flex-col">
        {displayName ? (
          <a
            href={`#/product/${product.handle}`}
            onClick={(e) => {
              e.preventDefault();
              onSelect(product.handle);
            }}
            className="text-[16px] font-medium text-[#111111] leading-[1.3] line-clamp-2 min-h-[2.6em] block hover:text-[#666666] transition-colors duration-[150ms] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
          >
            {displayName}
          </a>
        ) : (
          <div className="min-h-[2.6em]" />
        )}

        <div className="min-h-[18px] mt-1">
          {displayForm ? (
            <p className="text-[13px] text-[#666666] leading-tight">
              {displayForm}
            </p>
          ) : null}
        </div>
      </div>

      {/* 3. Bottom block: margin-top: auto, price (16px, weight 500) with 12px space under info block, then 12px space, then the 44px button */}
      <div className="mt-auto pt-3 flex flex-col">
        <div className="text-[16px] font-medium text-[#111111] tabular-nums leading-none">
          {formattedPrice}
        </div>

        {/* Secondary button: hover fill #111 & text white over 150ms, press scale(0.98) 100ms.
            Label cross-fades to "Added" over 150ms and back after 1.5s without size change. */}
        <button
          type="button"
          onClick={handleButtonClick}
          aria-label={buttonAriaLabel}
          className={`btn-secondary w-full h-[44px] mt-3 relative overflow-hidden text-[13px] font-medium whitespace-nowrap cursor-pointer flex items-center justify-center rounded-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] ${
            isAdded ? '!bg-[#111111] !text-white' : ''
          }`}
        >
          <span
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-[150ms] ease-[var(--ease-out)] ${
              isAdded ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            {hasOptions ? 'Choose dose' : 'Add to bag'}
          </span>
          <span
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-[150ms] ease-[var(--ease-out)] ${
              isAdded ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            Added
          </span>
        </button>
      </div>
    </article>
  );
};

/**
 * Shared loading skeleton matching the exact card structure and dimensions
 * to eliminate layout shift when data finishes loading.
 */
export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col h-full animate-soft-pulse" aria-hidden="true">
      {/* 1. Image tile */}
      <div className="w-full aspect-square bg-[#F5F5F5] rounded-[8px]" />

      {/* 2. Info block */}
      <div className="pt-3 flex flex-col">
        <div className="h-[2.6em] flex flex-col justify-between">
          <div className="h-[14px] bg-[#F5F5F5] rounded-[2px] w-3/4" />
          <div className="h-[14px] bg-[#F5F5F5] rounded-[2px] w-1/2" />
        </div>
        <div className="min-h-[18px] mt-1 flex items-center">
          <div className="h-[12px] bg-[#F5F5F5] rounded-[2px] w-1/3" />
        </div>
      </div>

      {/* 3. Bottom block */}
      <div className="mt-auto pt-3 flex flex-col">
        <div className="h-[16px] bg-[#F5F5F5] rounded-[2px] w-1/4" />
        <div className="mt-3 h-[44px] bg-[#F5F5F5] w-full" />
      </div>
    </div>
  );
};
