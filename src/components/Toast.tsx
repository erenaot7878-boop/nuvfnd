import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useCart, AddedToBagItem } from '../context/CartContext';

export const Toast: React.FC = () => {
  const {
    addedToBagItem,
    dismissAddedToast,
    setIsCartOpen,
    isCartOpen,
    toastMessage,
  } = useCart();

  // Active item to render (persists during 200ms exit animation)
  const [activeItem, setActiveItem] = useState<AddedToBagItem | null>(null);
  const [genericMessage, setGenericMessage] = useState<string | null>(null);

  // Animation phase: 'enter' (initial mount), 'visible' (interactive), 'exit' (animating out)
  const [animPhase, setAnimPhase] = useState<'enter' | 'visible' | 'exit'>('enter');

  // Pause on hover or focus
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Timer tracking
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingTimeRef = useRef<number>(3000);
  const lastStartRef = useRef<number>(Date.now());

  // Sticky bottom bar offset detection on mobile
  const [stickyBarHeight, setStickyBarHeight] = useState<number>(0);

  // Touch gesture tracking for mobile swipe-down dismiss
  const touchStartY = useRef<number>(0);
  const [dragY, setDragY] = useState<number>(0);

  // Check for mobile sticky "Add to bag" bar
  useEffect(() => {
    const updateStickyOffset = () => {
      if (window.innerWidth < 1024) {
        const el = document.querySelector('[data-sticky-add-bar="true"]');
        if (el) {
          setStickyBarHeight(el.getBoundingClientRect().height);
        } else {
          setStickyBarHeight(0);
        }
      } else {
        setStickyBarHeight(0);
      }
    };

    updateStickyOffset();
    const interval = setInterval(updateStickyOffset, 400);
    window.addEventListener('resize', updateStickyOffset);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updateStickyOffset);
    };
  }, []);

  // Dismiss immediately when the cart drawer opens
  useEffect(() => {
    if (isCartOpen) {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      setActiveItem(null);
      setGenericMessage(null);
    }
  }, [isCartOpen]);

  // Handle new or updated "added to bag" items
  useEffect(() => {
    if (!addedToBagItem) return;

    // Clear any previous exit timeout
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);

    // Update existing toast content or mount new one
    setActiveItem(addedToBagItem);
    setGenericMessage(null);
    setDragY(0);
    remainingTimeRef.current = 3000;
    lastStartRef.current = Date.now();

    // Trigger enter animation tick
    setAnimPhase('enter');
    const tick = setTimeout(() => {
      setAnimPhase('visible');
    }, 16);

    // Start 3-second auto-dismiss countdown
    timerRef.current = setTimeout(() => {
      handleDismiss();
    }, 3000);

    return () => {
      clearTimeout(tick);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [addedToBagItem]);

  // Handle generic messages (e.g. wishlist, compare)
  useEffect(() => {
    if (!toastMessage) return;

    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);

    setActiveItem(null);
    setGenericMessage(toastMessage);
    setDragY(0);
    remainingTimeRef.current = 3000;
    lastStartRef.current = Date.now();

    setAnimPhase('enter');
    const tick = setTimeout(() => {
      setAnimPhase('visible');
    }, 16);

    timerRef.current = setTimeout(() => {
      handleDismiss();
    }, 3000);

    return () => {
      clearTimeout(tick);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toastMessage]);

  // Pause / resume auto-dismiss timer on hover and focus
  useEffect(() => {
    if (!activeItem && !genericMessage) return;
    if (animPhase === 'exit') return;

    const isPaused = isHovered || isFocused;

    if (isPaused) {
      // Pause timer & record remaining time
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      const elapsed = Date.now() - lastStartRef.current;
      remainingTimeRef.current = Math.max(500, remainingTimeRef.current - elapsed);
    } else {
      // Resume timer
      lastStartRef.current = Date.now();
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        handleDismiss();
      }, remainingTimeRef.current);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isHovered, isFocused]);

  const handleDismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setAnimPhase('exit');

    // Wait 200ms for exit animation, then unmount
    exitTimerRef.current = setTimeout(() => {
      setActiveItem(null);
      setGenericMessage(null);
      dismissAddedToast();
    }, 200);
  };

  const handleViewBag = () => {
    handleDismiss();
    setIsCartOpen(true);
  };

  // Mobile swipe-down gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;
    if (diff > 0) {
      setDragY(diff);
    }
  };

  const handleTouchEnd = () => {
    if (dragY > 40) {
      handleDismiss();
    }
    setDragY(0);
  };

  if (!activeItem && !genericMessage) return null;

  // Responsive styling:
  // Desktop: top right (88px from top, 16px from right, 360px wide)
  // Mobile: bottom center (16px side margins, 16px above bottom / sticky bar)
  const mobileBottomStyle =
    window.innerWidth < 1024
      ? {
          bottom:
            stickyBarHeight > 0
              ? `calc(${stickyBarHeight}px + 16px + env(safe-area-inset-bottom, 0px))`
              : `calc(16px + env(safe-area-inset-bottom, 0px))`,
          transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
        }
      : undefined;

  const animClass =
    animPhase === 'visible'
      ? 'toast-anim-visible'
      : animPhase === 'exit'
      ? 'toast-anim-exit'
      : 'toast-anim-enter';

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={mobileBottomStyle}
      className={`fixed z-[110] left-4 right-4 w-[calc(100vw-32px)] max-w-[calc(100vw-32px)] lg:w-[360px] lg:max-w-[360px] lg:top-[88px] lg:right-4 lg:bottom-auto lg:left-auto bg-[#FFFFFF] border border-[#E6E6E6] rounded-[12px] shadow-[0_8px_24px_rgba(0,0,0,0.08)] px-4 py-3 select-none toast-anim-base ${animClass}`}
    >
      {activeItem ? (
        /* Redesigned "Added to bag" layout in one clean row */
        <div className="flex items-center gap-3">
          {/* 48px square thumbnail on the left (#F5F5F5, 8px radius, mix-blend-multiply image, 6px padding) */}
          <div className="w-[48px] h-[48px] shrink-0 bg-[#F5F5F5] rounded-[8px] p-[6px] flex items-center justify-center overflow-hidden">
            {activeItem.imageUrl ? (
              <img
                src={activeItem.imageUrl}
                alt={activeItem.productTitle}
                className="w-full h-full object-contain mix-blend-multiply pointer-events-none"
              />
            ) : (
              <span className="text-[12px] font-normal text-[#777777]">Rx</span>
            )}
          </div>

          {/* Two text lines: Product name (14px, weight 500, ellipsis) and "Added to bag" (13px, #666) */}
          <div className="flex-1 min-w-0 pr-1">
            <p className="text-[14px] font-medium text-[#111111] truncate leading-tight">
              {activeItem.productTitle}
            </p>
            <p className="text-[13px] text-[#666666] leading-tight mt-0.5">
              Added to bag
            </p>
          </div>

          {/* Text button "View bag" (14px, weight 500, underline on hover) */}
          <button
            type="button"
            onClick={handleViewBag}
            className="text-[14px] font-medium text-[#111111] hover:underline cursor-pointer whitespace-nowrap shrink-0 px-1 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
          >
            View bag
          </button>

          {/* Desktop-only 32x32 close button */}
          <button
            type="button"
            onClick={handleDismiss}
            className="hidden lg:flex w-8 h-8 items-center justify-center text-[#666666] hover:text-[#111111] transition-colors duration-[150ms] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] -mr-1 shrink-0"
            aria-label="Close notification"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>
      ) : (
        /* Fallback for general status messages */
        <div className="flex items-center justify-between gap-3 text-[14px] text-[#111111]">
          <span className="truncate">{genericMessage}</span>
          <button
            type="button"
            onClick={handleDismiss}
            className="hidden lg:flex w-8 h-8 items-center justify-center text-[#666666] hover:text-[#111111] transition-colors duration-[150ms] cursor-pointer -mr-1 shrink-0"
            aria-label="Close notification"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>
      )}
    </div>,
    document.body
  );
};
