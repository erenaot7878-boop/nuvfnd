import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { QuickViewModal } from './components/QuickViewModal';
import { CompareModal } from './components/CompareModal';
import { AuthModal } from './components/AuthModal';
import { Toast } from './components/Toast';
import { HomeView } from './views/HomeView';
import { ShopView } from './views/ShopView';
import { ProductDetailView } from './views/ProductDetailView';
import { CheckoutView } from './views/CheckoutView';
import { ProvidersView } from './views/ProvidersView';
import { ContactView } from './views/ContactView';
import { PrivacyView } from './views/PrivacyView';
import { TermsView } from './views/TermsView';
import { fetchProducts, fetchProductByHandle, fetchTypes, fetchTags } from './services/api';
import { Product, OrderDetails } from './types';
import { ArrowLeftRight } from 'lucide-react';

function MainApp() {
  const { isCartOpen, setIsCartOpen, setRecentOrder, showToast, wishlist, compareList } = useCart();
  
  // App State
  const [currentHash, setCurrentHash] = useState<string>(() => window.location.hash || '#/');
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  // Active filters for Shop
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isWishlistView, setIsWishlistView] = useState<boolean>(false);

  // Modals & PDP selection
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);

  // Parse Hash
  const { route, params } = useMemo(() => {
    const raw = currentHash || '#/';
    const [path, qs] = raw.split('?');
    const searchParams = new URLSearchParams(qs || '');
    return { route: path, params: searchParams };
  }, [currentHash]);

  const isCheckoutPage = route === '#/checkout';

  // Initial Data Fetch
  useEffect(() => {
    let isMounted = true;
    async function initCatalog() {
      setIsLoading(true);
      try {
        const [prodResult, typesResult, tagsResult] = await Promise.all([
          fetchProducts(),
          fetchTypes(),
          fetchTags(),
        ]);
        if (isMounted) {
          setProducts(prodResult.products);
          setFeaturedProducts(prodResult.products.filter(p => p.tags.includes('featured')));
          setTypes(typesResult);
          setTags(tagsResult);
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    initCatalog();
    return () => { isMounted = false; };
  }, []);

  // Hash router listener
  useEffect(() => {
    const onHashChange = () => {
      const newHash = window.location.hash || '#/';
      setCurrentHash(newHash);
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Sync params with Shop filter state when route changes
  useEffect(() => {
    if (route === '#/shop') {
      const typeParam = params.get('type') || '';
      const tagParam = params.get('tag') || '';
      const qParam = params.get('q') || '';
      const wishlistParam = params.get('wishlist') === 'true';
      setSelectedType(typeParam);
      setSelectedTag(tagParam);
      setSearchQuery(qParam);
      setIsWishlistView(wishlistParam);
    }
  }, [route, params]);

  // Handle single product detail route #/product/:handle
  useEffect(() => {
    const match = route.match(/^#\/product\/(.+)$/);
    if (match) {
      const handle = decodeURIComponent(match[1]);
      const cached = products.find(p => p.handle === handle);
      if (cached) {
        setActiveProduct(cached);
      } else {
        setIsLoadingProduct(true);
        fetchProductByHandle(handle).then(prod => {
          setActiveProduct(prod);
          setIsLoadingProduct(false);
        });
      }
    } else {
      setActiveProduct(null);
    }
  }, [route, products]);

  // Navigation handlers
  const navigate = useCallback((targetHash: string) => {
    window.location.hash = targetHash;
    setCurrentHash(targetHash);
    window.scrollTo(0, 0);
  }, []);

  const handleSelectProduct = useCallback((handle: string) => {
    navigate(`#/product/${encodeURIComponent(handle)}`);
  }, [navigate]);

  const handleSearchSubmit = useCallback((q: string) => {
    navigate(`#/shop?q=${encodeURIComponent(q)}`);
  }, [navigate]);

  const handleSelectType = useCallback((t: string) => {
    setSelectedType(t);
    const searchParams = new URLSearchParams();
    if (t) searchParams.set('type', t);
    if (selectedTag) searchParams.set('tag', selectedTag);
    if (searchQuery) searchParams.set('q', searchQuery);
    const qs = searchParams.toString();
    navigate(`#/shop${qs ? `?${qs}` : ''}`);
  }, [selectedTag, searchQuery, navigate]);

  const handleSelectTag = useCallback((tag: string) => {
    setSelectedTag(tag);
    const searchParams = new URLSearchParams();
    if (selectedType) searchParams.set('type', selectedType);
    if (tag) searchParams.set('tag', tag);
    if (searchQuery) searchParams.set('q', searchQuery);
    const qs = searchParams.toString();
    navigate(`#/shop${qs ? `?${qs}` : ''}`);
  }, [selectedType, searchQuery, navigate]);

  const handleClearFilters = useCallback(() => {
    setSelectedType('');
    setSelectedTag('');
    setSearchQuery('');
    navigate('#/shop');
  }, [navigate]);

  const handleOrderSuccess = useCallback((order: OrderDetails) => {
    setRecentOrder(order);
    showToast(`Order ${order.orderId} registered.`);
  }, [setRecentOrder, showToast]);

  // Products to pass to ShopView (filter by wishlist if active)
  const displayedShopProducts = useMemo(() => {
    if (isWishlistView) {
      return products.filter(p => wishlist.includes(p.handle));
    }
    return products;
  }, [products, isWishlistView, wishlist]);

  if (isCheckoutPage) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] text-[#111111]">
        <CheckoutView
          onNavigate={navigate}
          onOpenCart={() => setIsCartOpen(true)}
        />
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          onOpenCheckout={() => {
            setIsCartOpen(false);
            navigate('#/checkout');
          }}
          onNavigateProduct={handleSelectProduct}
          products={products}
        />
        <Toast />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden bg-[#FFFFFF] text-[#111111]">
      {/* Header */}
      <Header
        currentRoute={currentHash}
        onNavigate={navigate}
        onSearch={handleSearchSubmit}
        onOpenAuth={() => setIsAuthOpen(true)}
        products={products}
        onSelectProduct={handleSelectProduct}
      />

      {/* Main Content Area */}
      <main key={route} className="flex-1 w-full min-w-0 animate-page-enter">
        {route === '#/' && (
          <HomeView
            featuredProducts={featuredProducts}
            isLoading={isLoading}
            onNavigate={navigate}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {route === '#/shop' && (
          <ShopView
            products={displayedShopProducts}
            types={types}
            tags={tags}
            isLoading={isLoading}
            selectedType={selectedType}
            selectedTag={selectedTag}
            searchQuery={searchQuery}
            onSelectType={handleSelectType}
            onSelectTag={handleSelectTag}
            onSearchChange={setSearchQuery}
            onSelectProduct={handleSelectProduct}
            onClearFilters={handleClearFilters}
            isWishlistFilter={isWishlistView}
          />
        )}

        {route.startsWith('#/product/') && (
          isLoadingProduct ? (
            <div className="py-24 text-center space-y-3 max-w-[1280px] mx-auto px-5">
              <div className="w-8 h-8 border border-[#111111] border-t-transparent animate-spin mx-auto" />
              <p className="text-[14px] text-[#666666]">Loading formulation</p>
            </div>
          ) : activeProduct ? (
            <ProductDetailView
              product={activeProduct}
              allProducts={products}
              onBack={() => navigate('#/shop')}
              onSelectProduct={handleSelectProduct}
            />
          ) : (
            <div className="text-center py-24 bg-[#F5F5F5] p-12 max-w-lg mx-auto my-12 px-5 space-y-4">
              <h2 className="text-xl font-medium tracking-tight text-[#111111] font-['Jost']">
                Compound Not Found
              </h2>
              <p className="text-[14px] text-[#666666] font-light">
                The requested formulation could not be located in the current formulary.
              </p>
              <button
                onClick={() => navigate('#/shop')}
                className="px-6 py-3 bg-[#111111] text-white text-[11px] uppercase tracking-[0.14em] font-medium transition-colors cursor-pointer"
              >
                Browse formulary
              </button>
            </div>
          )
        )}

        {route === '#/providers' && (
          <ProvidersView />
        )}

        {route === '#/contact' && (
          <ContactView />
        )}

        {route === '#/privacy' && (
          <PrivacyView />
        )}

        {route === '#/terms' && (
          <TermsView />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={navigate} />

      {/* Global Drawers & Modals */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOpenCheckout={() => {
          setIsCartOpen(false);
          navigate('#/checkout');
        }}
        onNavigateProduct={handleSelectProduct}
        onNavigateShop={() => navigate('#/shop')}
        products={products}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onNavigateDetail={handleSelectProduct}
      />

      <CompareModal
        products={products}
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        onSelectProduct={handleSelectProduct}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Compare Floating Bar if items are added */}
      {compareList.length > 0 && !isCompareOpen && (
        <div className="fixed bottom-6 right-6 z-40 bg-[#111111] text-white px-5 py-3 border border-[#111111] flex items-center gap-4 text-[14px]">
          <span>Compare ({compareList.length}/3)</span>
          <button
            onClick={() => setIsCompareOpen(true)}
            className="underline underline-offset-4 font-medium text-white hover:text-[#CCCCCC] cursor-pointer text-[11px] uppercase tracking-[0.14em]"
          >
            VIEW
          </button>
        </div>
      )}

      {/* Toast */}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <MainApp />
    </CartProvider>
  );
}
