import React, { useEffect, useRef, useState, useMemo } from 'react';
import { X, Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCheckout: () => void;
  onNavigateProduct: (handle: string) => void;
  products?: Product[];
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onOpenCheckout,
  onNavigateProduct,
  products = [],
}) => {
  const { cart, updateQty, removeFromCart, cartTotal, cartCount, addToCart } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Animation states
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [removingId, setRemovingId] = useState<string | null>(null);

  // Open/close lifecycle (open 350ms, close 250ms)
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (isOpen) {
      setIsRendered(true);
      timeout = setTimeout(() => {
        setIsVisible(true);
      }, 10);
    } else {
      setIsVisible(false);
      timeout = setTimeout(() => {
        setIsRendered(false);
      }, 250);
    }
    return () => clearTimeout(timeout);
  }, [isOpen]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen]);

  // Escape key & focus trapping
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();

      if (e.key === 'Tab' && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Cross-sell products: pick products not currently in cart
  const crossSellProducts = useMemo(() => {
    const cartHandles = new Set(cart.map((item) => item.productHandle));
    const available = products.filter((p) => !cartHandles.has(p.handle));
    return available.slice(0, 4);
  }, [products, cart]);

  const handleUpdateQty = (variantId: string, newQty: number) => {
    setUpdatingId(variantId);
    setIsUpdating(true);

    if (newQty <= 0) {
      setRemovingId(variantId);
      setTimeout(() => {
        removeFromCart(variantId);
        setRemovingId(null);
        setUpdatingId(null);
        setIsUpdating(false);
      }, 250);
    } else {
      updateQty(variantId, newQty);
      setTimeout(() => {
        setUpdatingId(null);
        setIsUpdating(false);
      }, 150);
    }
  };

  const handleRemove = (variantId: string) => {
    setRemovingId(variantId);
    setUpdatingId(variantId);
    setIsUpdating(true);
    setTimeout(() => {
      removeFromCart(variantId);
      setRemovingId(null);
      setUpdatingId(null);
      setIsUpdating(false);
    }, 250);
  };

  const handleAddCrossSell = (product: Product) => {
    const primaryVariant = product.variants.edges[0]?.node;
    if (!primaryVariant) return;

    const isDefault =
      primaryVariant.title.toLowerCase().includes('default title') ||
      product.variants.edges.length <= 1;

    addToCart(
      {
        variantId: primaryVariant.id,
        productHandle: product.handle,
        productTitle: product.title,
        variantTitle: isDefault ? '' : primaryVariant.title,
        price: primaryVariant.price.amount,
        currencyCode: primaryVariant.price.currencyCode || 'USD',
        imageUrl: product.images.edges[0]?.node?.url,
        productType: product.productType,
      },
      1
    );
  };

  if (!isRendered) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Cart"
    >
      {/* Overlay: flat dark rgba(0,0,0,0.4), no blur, 250ms fade */}
      <div
        className={`fixed inset-0 bg-[#000000]/40 transition-opacity duration-[250ms] ${
          isVisible ? 'opacity-100 ease-[var(--ease-out)]' : 'opacity-0 ease-[var(--ease-in-out)]'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer: 480px wide on desktop, slides in from right over 350ms --ease-out, closes over 250ms --ease-in-out */}
      <div className="fixed inset-y-0 right-0 max-w-full flex justify-end">
        <div
          ref={drawerRef}
          className={`w-full sm:max-w-[480px] h-full bg-[#FFFFFF] rounded-none sm:rounded-l-[16px] flex flex-col transition-transform select-text overflow-hidden ${
            isVisible
              ? 'translate-x-0 duration-[350ms] ease-[var(--ease-out)]'
              : 'translate-x-full duration-[250ms] ease-[var(--ease-in-out)]'
          }`}
        >
          {/* Header */}
          <div className="shrink-0 px-6 h-20 border-b border-[#E6E6E6] flex items-center justify-between">
            <h2 className="text-[32px] font-normal text-[#111111] leading-none tracking-normal flex items-baseline">
              <span>Cart</span>
              <sup className="text-[14px] font-normal ml-1 -top-2.5 relative text-[#777777]">
                {cartCount}
              </sup>
            </h2>
            <button
              onClick={onClose}
              className="w-11 h-11 flex items-center justify-center text-[#111111] hover:text-[#777777] transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X size={24} strokeWidth={1.5} />
            </button>
          </div>

          {/* Payment line */}
          <div className="shrink-0 px-6 py-2.5 border-b border-[#E6E6E6] text-[13px] text-[#777777] font-normal">
            Visa, Mastercard, HSA, FSA, Apple Pay
          </div>

          {/* Scrolling body */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {cart.length === 0 ? (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center space-y-4">
                <p className="text-[20px] font-normal text-[#111111]">
                  Your cart is empty.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateProduct('#/shop');
                  }}
                  className="px-6 py-3 border border-[#111111] text-[#111111] rounded-[4px] text-[13px] font-medium hover:bg-[#F5F5F5] transition-colors cursor-pointer"
                >
                  Continue shopping
                </button>
              </div>
            ) : (
              <div>
                {/* Cart items: 24px between items, no dividers */}
                <div className="space-y-6">
                  {cart.map((item) => {
                    const isFading = updatingId === item.variantId;

                    // Clean form and dose string: filter out "Default Title" and blanks
                    const cleanVariant =
                      item.variantTitle &&
                      !item.variantTitle.toLowerCase().includes('default title')
                        ? item.variantTitle
                        : '';
                    const formAndDose = [item.productType, cleanVariant]
                      .filter(Boolean)
                      .join(', ');

                    return (
                      <div
                        key={item.variantId}
                        className={`flex gap-4 items-start transition-all duration-[250ms] ease-[var(--ease-out)] ${
                          removingId === item.variantId
                            ? 'opacity-0 -translate-y-2 pointer-events-none'
                            : 'opacity-100 translate-y-0 animate-fade-250'
                        }`}
                      >
                        {/* Left: 96px square tile (#F5F5F5, 8px radius, multiply image, 12px padding) */}
                        <div
                          onClick={() => {
                            onClose();
                            onNavigateProduct(item.productHandle);
                          }}
                          className="w-[96px] h-[96px] shrink-0 bg-[#F5F5F5] rounded-[8px] p-3 flex items-center justify-center cursor-pointer overflow-hidden"
                        >
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.productTitle}
                              className="w-full h-full object-contain mix-blend-multiply"
                            />
                          ) : (
                            <span className="text-[14px] text-[#777777] font-normal">
                              Rx
                            </span>
                          )}
                        </div>

                        {/* Right: details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div>
                            {/* Product name 16px weight 500 with price right-aligned on same line */}
                            <div className="flex items-baseline justify-between gap-2">
                              <h3
                                onClick={() => {
                                  onClose();
                                  onNavigateProduct(item.productHandle);
                                }}
                                className="text-[16px] font-medium text-[#111111] leading-snug truncate cursor-pointer hover:text-[#777777] transition-colors"
                              >
                                {item.productTitle}
                              </h3>
                              <span className="text-[16px] font-medium text-[#111111] shrink-0 tabular-nums">
                                ${(Number(item.price) * item.qty).toFixed(2)}
                              </span>
                            </div>

                            {/* One grey 14px line (#777) with form and dose */}
                            <div className="text-[14px] text-[#777777] font-normal leading-normal mt-1">
                              {formAndDose || item.productType || 'Compounded medication'}
                            </div>
                          </div>

                          {/* Bottom row: Stepper (104px wide, 40px high, 1px #CFCFCF border, 8px radius) on left, Remove button on right */}
                          <div className="flex items-center justify-between pt-3">
                            <div className="w-[104px] h-[40px] border border-[#CFCFCF] rounded-[8px] flex items-center justify-between px-3 text-[#111111]">
                              <button
                                type="button"
                                onClick={() => handleUpdateQty(item.variantId, item.qty - 1)}
                                disabled={isUpdating}
                                className="w-6 h-full flex items-center justify-center text-[#111111] hover:text-[#777777] cursor-pointer disabled:opacity-30"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={16} strokeWidth={1.5} />
                              </button>
                              <span className="text-[14px] font-normal tabular-nums select-none">
                                {item.qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateQty(item.variantId, item.qty + 1)}
                                disabled={isUpdating}
                                className="w-6 h-full flex items-center justify-center text-[#111111] hover:text-[#777777] cursor-pointer disabled:opacity-30"
                                aria-label="Increase quantity"
                              >
                                <Plus size={16} strokeWidth={1.5} />
                              </button>
                            </div>

                            {/* "Remove" text button (14px, grey, with 16px Lucide trash icon, darkens on hover) */}
                            <button
                              type="button"
                              onClick={() => handleRemove(item.variantId)}
                              disabled={isUpdating}
                              className="text-[14px] text-[#777777] hover:text-[#111111] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-30"
                            >
                              <span>Remove</span>
                              <Trash2 size={16} strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Optional cross-sell row if available */}
                {crossSellProducts.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-[#E6E6E6]">
                    <h4 className="text-[18px] font-medium text-[#111111] mb-4">
                      Complete your routine
                    </h4>

                    <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-6 px-6">
                      {crossSellProducts.map((p) => {
                        const price = Number(p.priceRange.minVariantPrice.amount).toFixed(2);
                        const img = p.images.edges[0]?.node?.url;

                        return (
                          <div
                            key={p.id}
                            className="shrink-0 w-[260px] snap-start bg-[#F5F5F5] rounded-[8px] p-3 flex gap-3 items-center"
                          >
                            <div className="w-[64px] h-[64px] shrink-0 bg-[#FFFFFF] rounded-[6px] p-1.5 flex items-center justify-center overflow-hidden">
                              {img ? (
                                <img
                                  src={img}
                                  alt={p.title}
                                  className="w-full h-full object-contain mix-blend-multiply"
                                />
                              ) : (
                                <span className="text-[12px] text-[#777777]">Rx</span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                              <div className="flex items-baseline justify-between gap-1">
                                <span className="text-[14px] font-medium text-[#111111] truncate">
                                  {p.title}
                                </span>
                                <span className="text-[14px] font-medium text-[#111111] shrink-0 tabular-nums">
                                  ${price}
                                </span>
                              </div>

                              <p className="text-[12px] text-[#777777] truncate mt-0.5">
                                {p.productType}
                              </p>

                              <button
                                type="button"
                                onClick={() => handleAddCrossSell(p)}
                                className="text-[12px] uppercase font-medium text-[#111111] hover:text-[#666666] flex items-center gap-1.5 mt-2 cursor-pointer transition-colors"
                              >
                                <span>Add</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-[#111111] inline-block" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer pinned at bottom: Total row (20px), grey line "Discount codes applied at checkout", full-width 52px black "Checkout" button */}
          {cart.length > 0 && (
            <div className="shrink-0 bg-[#F5F5F5] p-6 space-y-3">
              {/* Total row (20px) with 150ms cross-fade */}
              <div className="flex justify-between items-baseline text-[20px] font-medium text-[#111111]">
                <span>Total</span>
                <span key={cartTotal} className="animate-fade-150 inline-block tabular-nums">${cartTotal.toFixed(2)}</span>
              </div>

              {/* Grey line "Discount codes applied at checkout" */}
              <div className="text-[14px] text-[#777777] font-normal">
                Discount codes applied at checkout
              </div>

              {/* Full-width 52px black "Checkout" button with btn-primary motion */}
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => {
                  onClose();
                  onOpenCheckout();
                }}
                className="btn-primary w-full h-[52px] rounded-[4px] text-[14px] font-medium cursor-pointer flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
              >
                Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
