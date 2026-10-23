import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, OrderDetails } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
  updateQty: (variantId: string, qty: number) => void;
  removeFromCart: (variantId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  wishlist: string[];
  toggleWishlist: (handle: string) => void;
  isInWishlist: (handle: string) => boolean;
  compareList: string[];
  toggleCompare: (handle: string) => void;
  isInCompare: (handle: string) => boolean;
  clearCompare: () => void;
  toastMessage: string | null;
  showToast: (message: string) => void;
  recentOrder: OrderDetails | null;
  setRecentOrder: (order: OrderDetails | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('nuvmed_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nuvmed_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [compareList, setCompareList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nuvmed_compare');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [recentOrder, setRecentOrder] = useState<OrderDetails | null>(() => {
    try {
      const saved = localStorage.getItem('nuvmed_recent_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('nuvmed_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('nuvmed_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.warn('Could not save wishlist', e);
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem('nuvmed_compare', JSON.stringify(compareList));
    } catch (e) {
      console.warn('Could not save compare', e);
    }
  }, [compareList]);

  useEffect(() => {
    if (recentOrder) {
      try {
        localStorage.setItem('nuvmed_recent_order', JSON.stringify(recentOrder));
      } catch (e) {
        console.warn('Could not save order', e);
      }
    }
  }, [recentOrder]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(prev => (prev === message ? null : prev));
    }, 2800);
  };

  const addToCart = (item: Omit<CartItem, 'qty'>, qty: number = 1) => {
    setCart(prev => {
      const existing = prev.find(line => line.variantId === item.variantId);
      if (existing) {
        return prev.map(line =>
          line.variantId === item.variantId
            ? { ...line, qty: line.qty + qty }
            : line
        );
      }
      return [...prev, { ...item, qty }];
    });
    showToast(`Added to cart: ${item.productTitle}`);
  };

  const updateQty = (variantId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(variantId);
    } else {
      setCart(prev =>
        prev.map(line =>
          line.variantId === variantId ? { ...line, qty } : line
        )
      );
    }
  };

  const removeFromCart = (variantId: string) => {
    setCart(prev => prev.filter(line => line.variantId !== variantId));
    showToast('Removed from cart');
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (handle: string) => {
    setWishlist(prev => {
      if (prev.includes(handle)) {
        showToast('Removed from wishlist');
        return prev.filter(h => h !== handle);
      } else {
        showToast('Added to wishlist');
        return [...prev, handle];
      }
    });
  };

  const isInWishlist = (handle: string) => wishlist.includes(handle);

  const toggleCompare = (handle: string) => {
    setCompareList(prev => {
      if (prev.includes(handle)) {
        showToast('Removed from comparison');
        return prev.filter(h => h !== handle);
      } else {
        if (prev.length >= 3) {
          showToast('Comparison limit is 3 items');
          return prev;
        }
        showToast('Added to comparison');
        return [...prev, handle];
      }
    });
  };

  const isInCompare = (handle: string) => compareList.includes(handle);
  const clearCompare = () => setCompareList([]);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount,
        isCartOpen,
        setIsCartOpen,
        wishlist,
        toggleWishlist,
        isInWishlist,
        compareList,
        toggleCompare,
        isInCompare,
        clearCompare,
        toastMessage,
        showToast,
        recentOrder,
        setRecentOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
