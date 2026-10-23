import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Check } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onNavigateDetail: (handle: string) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onNavigateDetail,
}) => {
  const { addToCart, setIsCartOpen } = useCart();
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const variants = product.variants.edges.map((e) => e.node);
  const currentVariant = variants[selectedVariantIdx] || variants[0];
  const primaryImage = product.images.edges[0]?.node?.url;

  const handleAdd = () => {
    if (!currentVariant) return;

    addToCart(
      {
        variantId: currentVariant.id,
        productHandle: product.handle,
        productTitle: product.title,
        variantTitle: currentVariant.title,
        price: currentVariant.price.amount,
        currencyCode: currentVariant.price.currencyCode || 'USD',
        imageUrl: primaryImage,
        productType: product.productType,
      },
      qty
    );

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
      setIsCartOpen(true);
    }, 400);
  };

  return createPortal(
    <div
      className="fixed inset-0 pointer-events-none"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-[#000000]/40 z-[90] pointer-events-auto transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-[100] overflow-y-auto flex items-center justify-center p-4 sm:p-6 pointer-events-none">
        <div className="pointer-events-auto relative bg-[#FFFFFF] max-w-2xl w-full border border-[#E6E6E6] shadow-2xl grid grid-cols-1 md:grid-cols-2">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center text-[#111111] hover:text-[#888888] cursor-pointer"
          aria-label="Close"
        >
          <X size={20} strokeWidth={1.5} />
        </button>

        {/* 4:5 image tile */}
        <div className="bg-[#F5F5F5] p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-[#E6E6E6]">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={product.title}
              className="max-h-60 object-contain"
            />
          ) : (
            <span className="text-[11px] uppercase tracking-[0.14em] text-[#888888]">
              {product.productType}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <h3 className="text-xl font-medium tracking-tight text-[#111111] font-['Jost']">
              {product.title}
            </h3>

            <div className="font-['Barlow_Condensed'] font-semibold text-2xl text-[#111111] tabular-nums">
              ${Number(currentVariant?.price.amount || 0).toFixed(2)}
            </div>

            <p className="text-[12px] leading-[1.6] text-[#666666] font-light line-clamp-3">
              {product.description}
            </p>

            {variants.length > 1 && (
              <div className="space-y-2 pt-2">
                <span className="text-[14px] text-[#111111] font-normal block">
                  Select dosage
                </span>
                <div className="space-y-1.5">
                  {variants.map((v, idx) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantIdx(idx)}
                      className={`w-full text-left py-2 px-3 text-[14px] border flex items-center justify-between cursor-pointer transition-colors ${
                        selectedVariantIdx === idx
                          ? 'border-[#111111] bg-[#111111] text-white font-medium'
                          : 'border-[#E6E6E6] text-[#111111] hover:border-[#111111]'
                      }`}
                    >
                      <span>{v.title}</span>
                      <span className="font-['Barlow_Condensed'] text-[15px] tabular-nums">
                        ${Number(v.price.amount).toFixed(2)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-4 border-t border-[#E6E6E6]">
            <div className="flex gap-3">
              <div className="flex items-center border border-[#E6E6E6] h-10">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-8 h-full flex items-center justify-center text-[#111111] hover:bg-[#F5F5F5] cursor-pointer"
                >
                  -
                </button>
                <span className="w-8 text-center text-[14px] font-['Barlow_Condensed'] font-semibold tabular-nums text-[#111111]">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty(qty + 1)}
                  className="w-8 h-full flex items-center justify-center text-[#111111] hover:bg-[#F5F5F5] cursor-pointer"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 h-10 bg-[#111111] hover:bg-[#222222] text-white text-[11px] uppercase tracking-[0.14em] font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {added ? (
                  <>
                    <Check size={16} strokeWidth={1.5} />
                    <span>ADDED</span>
                  </>
                ) : (
                  <span>ADD TO BAG</span>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateDetail(product.handle);
              }}
              className="w-full text-center text-[14px] text-[#111111] underline underline-offset-4 hover:text-[#666666] cursor-pointer"
            >
              View full clinical details
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
