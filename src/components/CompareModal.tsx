import React from 'react';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface CompareModalProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (handle: string) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  products,
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const { compareList, toggleCompare, clearCompare, addToCart } = useCart();

  if (!isOpen || compareList.length === 0) return null;

  const compareProducts = products.filter((p) => compareList.includes(p.handle));

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-[#000000]/40 transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-[#FFFFFF] max-w-4xl w-full border border-[#E6E6E6] z-10 flex flex-col my-8">
        <div className="px-8 h-16 border-b border-[#E6E6E6] flex items-center justify-between">
          <span className="text-[14px] font-medium text-[#111111]">
            Compare formulations ({compareProducts.length}/3)
          </span>
          <div className="flex items-center gap-4">
            <button
              onClick={clearCompare}
              className="text-[14px] text-[#666666] hover:text-[#111111] cursor-pointer"
            >
              Clear all
            </button>
            <button
              onClick={onClose}
              className="text-[#111111] hover:text-[#888888] cursor-pointer"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div className="p-8 overflow-x-auto">
          <div className="grid grid-cols-3 gap-6 min-w-[640px]">
            {compareProducts.map((p) => {
              const primaryVariant = p.variants.edges[0]?.node;
              return (
                <div key={p.id} className="border border-[#E6E6E6] p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="aspect-[4/5] bg-[#F5F5F5] p-6 relative flex items-center justify-center">
                      <img
                        src={p.images.edges[0]?.node.url}
                        alt={p.title}
                        className="w-full h-full object-contain"
                      />
                      <button
                        onClick={() => toggleCompare(p.handle)}
                        className="absolute top-2 right-2 text-[#888888] hover:text-[#111111] p-1 cursor-pointer"
                        title="Remove from comparison"
                      >
                        <Trash2 size={20} strokeWidth={1.5} />
                      </button>
                    </div>

                    <div className="text-center space-y-1">
                      <span className="text-[14px] text-[#666666] block">
                        {p.productType}
                      </span>
                      <h4
                        onClick={() => {
                          onClose();
                          onSelectProduct(p.handle);
                        }}
                        className="text-[14px] font-medium text-[#111111] cursor-pointer hover:underline underline-offset-4"
                      >
                        {p.title}
                      </h4>
                      <div className="font-['Barlow_Condensed'] font-semibold text-[17px] text-[#111111] tabular-nums">
                        ${Number(p.priceRange.minVariantPrice.amount).toFixed(2)}
                      </div>
                    </div>

                    <div className="border-t border-[#E6E6E6] pt-3 text-[14px] text-[#666666] space-y-2">
                      <div>
                        <strong className="text-[#111111] block font-normal">Format</strong>
                        <span>{p.productType}</span>
                      </div>
                      <div>
                        <strong className="text-[#111111] block font-normal">Requirement</strong>
                        <span>Prescription required</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (primaryVariant) {
                        addToCart({
                          variantId: primaryVariant.id,
                          productHandle: p.handle,
                          productTitle: p.title,
                          variantTitle: primaryVariant.title,
                          price: primaryVariant.price.amount,
                          currencyCode: primaryVariant.price.currencyCode || 'USD',
                          imageUrl: p.images.edges[0]?.node.url,
                          productType: p.productType,
                        });
                      }
                    }}
                    className="w-full py-3 bg-[#111111] hover:bg-[#222222] text-white text-[11px] uppercase tracking-[0.14em] font-medium transition-colors cursor-pointer"
                  >
                    ADD TO BAG
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
