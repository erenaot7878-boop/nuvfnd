import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, ShoppingBag, User, X, Menu } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface HeaderProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onSearch: (query: string) => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  onNavigate,
  onSearch,
  onOpenAuth,
}) => {
  const { cartCount, setIsCartOpen } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  // Mobile drawer state & animation
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMenuMounted, setIsMenuMounted] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // Focus management refs
  const hamburgerBtnRef = useRef<HTMLButtonElement>(null);
  const searchBtnRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuTriggerRef = useRef<HTMLElement | null>(null);

  // Scroll states for sticky header border/shadow and mobile hide/show
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileHeaderVisible, setMobileHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Cart badge bump animation
  const [badgeBumping, setBadgeBumping] = useState(false);
  const prevCountRef = useRef(cartCount);

  useEffect(() => {
    if (prevCountRef.current !== cartCount) {
      prevCountRef.current = cartCount;
      setBadgeBumping(true);
      const timer = setTimeout(() => setBadgeBumping(false), 250);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  // Mobile menu mount/unmount timing: 300ms open slide-in, 250ms close slide-out
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (mobileMenuOpen) {
      menuTriggerRef.current = document.activeElement as HTMLElement;
      setIsMenuMounted(true);
      timer = setTimeout(() => {
        setIsMenuVisible(true);
        drawerRef.current?.focus();
      }, 16);
    } else {
      setIsMenuVisible(false);
      timer = setTimeout(() => {
        setIsMenuMounted(false);
        if (menuTriggerRef.current) {
          menuTriggerRef.current.focus();
        } else {
          hamburgerBtnRef.current?.focus();
        }
      }, 250);
    }
    return () => clearTimeout(timer);
  }, [mobileMenuOpen]);

  // Lock body & html scroll when mobile menu is open (without layout jump)
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyOverflow = document.body.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      return () => {
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.overflow = originalBodyOverflow;
      };
    }
  }, [mobileMenuOpen]);

  // Focus trap & Escape key listener for the drawer
  useEffect(() => {
    if (!isMenuMounted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        return;
      }

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
  }, [isMenuMounted]);

  // Automatically close mobile menu if viewport widens to 1024px or larger
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  // Scroll listener: >8px triggers border/shadow fade; mobile scroll hides/shows header
  // While drawer is open, header does NOT hide on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 8);

      if (mobileMenuOpen || currentScrollY <= 8 || isSearchOpen) {
        setMobileHeaderVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 56) {
        setMobileHeaderVisible(false); // scrolling down -> hide
      } else if (currentScrollY < lastScrollY.current) {
        setMobileHeaderVisible(true); // scrolling up -> return
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileMenuOpen, isSearchOpen]);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close search on Esc or click outside
  useEffect(() => {
    if (!isSearchOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        searchBtnRef.current?.focus();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen]);

  // Focus input when search bar opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      onSearch(searchVal.trim());
      setIsSearchOpen(false);
      setSearchVal('');
    }
  };

  const navLinks = [
    { label: 'Shop', route: '#/shop' },
    { label: 'Providers', route: '#/providers' },
    { label: 'Contact', route: '#/contact' },
  ];

  return (
    <>
      {/* Header: z-40. Idle state has NO transform, will-change, or filter */}
      <header
        className={`sticky top-0 z-[40] bg-[#FFFFFF] ${
          mobileHeaderVisible
            ? ''
            : '-translate-y-full transition-transform duration-[250ms] ease-[var(--ease-in-out)] lg:translate-y-0'
        }`}
      >
        {/* 1px bottom border and subtle shadow fading in only after user scrolls past 8px */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-[1px] bg-[#E6E6E6] shadow-[0_2px_4px_rgba(0,0,0,0.02)] pointer-events-none transition-opacity duration-[250ms] ease-[var(--ease-out)] ${
            isScrolled ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* DESKTOP HEADER (1024px and up: 72px high) */}
        <div className="hidden lg:flex max-w-[1280px] mx-auto px-10 h-[72px] items-center justify-between">
          {/* Left: Logo and nav links */}
          <div className="flex items-center gap-10">
            <button
              onClick={() => onNavigate('#/')}
              className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
              aria-label="Nuvmed Home"
            >
              <span className="text-[20px] font-medium tracking-[0.16em] text-[#111111] uppercase font-['Jost']">
                NUVMED
              </span>
            </button>

            <nav className="flex items-center gap-8" aria-label="Main Navigation">
              {navLinks.map((link) => {
                const isActive =
                  currentRoute === link.route ||
                  (link.route !== '#/' && currentRoute.startsWith(link.route));
                return (
                  <button
                    key={link.label}
                    onClick={() => onNavigate(link.route)}
                    className="group relative py-2 text-[15px] font-medium cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
                  >
                    <span
                      className={`transition-colors duration-[150ms] ${
                        isActive
                          ? 'text-[#111111]'
                          : 'text-[#666666] group-hover:text-[#111111]'
                      }`}
                    >
                      {link.label}
                    </span>
                    <span
                      className={`absolute bottom-0 left-0 h-[1.5px] w-full bg-[#111111] origin-left transition-transform duration-[250ms] ease-[var(--ease-out)] ${
                        isActive
                          ? 'scale-x-100'
                          : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    />
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right: Search, Account, Bag */}
          <div className="flex items-center gap-2">
            {/* Search Icon */}
            <button
              ref={searchBtnRef}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="w-11 h-11 flex items-center justify-center text-[#111111] hover:text-[#666666] transition-colors duration-[150ms] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
              aria-label="Search"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>

            {/* Account Icon */}
            <button
              onClick={onOpenAuth}
              className="w-11 h-11 flex items-center justify-center text-[#111111] hover:text-[#666666] transition-colors duration-[150ms] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
              aria-label="Account"
            >
              <User size={20} strokeWidth={1.5} />
            </button>

            {/* Bag Icon with count badge */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="h-11 px-3 flex items-center gap-2 text-[#111111] hover:text-[#666666] transition-colors duration-[150ms] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
              aria-label={`Bag with ${cartCount} items`}
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              <span
                className={`text-[14px] font-medium inline-block ${
                  badgeBumping ? 'animate-badge-bump' : ''
                }`}
              >
                ({cartCount})
              </span>
            </button>
          </div>
        </div>

        {/* MOBILE HEADER (below 1024px: 56px high, solid white, z-40) */}
        <div className="flex lg:hidden h-[56px] px-5 items-center justify-between w-full bg-[#FFFFFF]">
          {/* Left: Hamburger (44x44 tap area) */}
          <button
            ref={hamburgerBtnRef}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu-drawer"
            className="w-11 h-11 flex items-center justify-center text-[#111111] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>

          {/* Center: Logo */}
          <button
            onClick={() => onNavigate('#/')}
            className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
            aria-label="Nuvmed Home"
          >
            <span className="text-[18px] font-medium tracking-[0.16em] text-[#111111] uppercase font-['Jost']">
              NUVMED
            </span>
          </button>

          {/* Right: Search and Bag (44x44 tap areas) */}
          <div className="flex items-center">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="w-11 h-11 flex items-center justify-center text-[#111111] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
              aria-label="Search"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="w-11 h-11 flex items-center justify-center text-[#111111] cursor-pointer overflow-visible focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
              aria-label={`Bag with ${cartCount} items`}
            >
              <div className="relative flex items-center justify-center">
                <ShoppingBag size={20} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span
                    className={`absolute -top-1.5 -right-2.5 w-[18px] h-[18px] rounded-full bg-[#111111] text-[#FFFFFF] text-[11px] font-medium flex items-center justify-center leading-none pointer-events-none select-none ${
                      badgeBumping ? 'animate-badge-bump' : ''
                    }`}
                  >
                    {cartCount}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* FULL-WIDTH SEARCH OVERLAY (Rendered via React Portal into document.body)
          Covers the full screen including header: overlay z-[90], panel z-[100] */}
      {isSearchOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            className="fixed inset-0 pointer-events-none"
          >
            {/* Overlay covering full screen including header */}
            <div
              className="fixed inset-0 bg-[#000000]/40 z-[90] pointer-events-auto transition-opacity duration-[250ms] ease-out"
              onClick={() => setIsSearchOpen(false)}
              aria-hidden="true"
            />

            {/* Search Bar Panel at top of screen */}
            <div
              ref={searchContainerRef}
              className="fixed top-0 left-0 right-0 z-[100] pointer-events-auto border-b border-[#E6E6E6] bg-[#FFFFFF] py-4 px-6 sm:px-10 shadow-lg animate-fade-150"
            >
              <form
                onSubmit={handleSearchSubmit}
                className="max-w-[1280px] mx-auto flex items-center gap-4"
              >
                <Search size={20} strokeWidth={1.5} className="text-[#666666] shrink-0" />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="Search products by name or compound…"
                  className="flex-1 text-[15px] py-1.5 bg-transparent text-[#111111] placeholder-[#888888] outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2 btn-primary text-[12px] font-medium cursor-pointer rounded-none"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="w-10 h-10 flex items-center justify-center text-[#111111] hover:text-[#666666] transition-colors duration-[150ms] cursor-pointer"
                  aria-label="Close search"
                >
                  <X size={20} strokeWidth={1.5} />
                </button>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* MOBILE DRAWER & OVERLAY (Rendered via React Portal into document.body)
          Overlay z-[90], Drawer panel z-[100], h-[100dvh], tabIndex -1 */}
      {isMenuMounted &&
        createPortal(
          <div
            id="mobile-menu-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="lg:hidden fixed inset-0 pointer-events-none"
          >
            {/* Overlay: z-[90], covers the whole screen */}
            <div
              className={`fixed inset-0 bg-[#000000]/40 z-[90] pointer-events-auto transition-opacity duration-[250ms] ${
                isMenuVisible ? 'opacity-100 ease-out' : 'opacity-0 ease-in-out'
              }`}
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer: z-[100], h-[100dvh], tabIndex -1, solid white */}
            <div
              ref={drawerRef}
              tabIndex={-1}
              className={`fixed top-0 left-0 bottom-0 w-[85vw] max-w-[360px] h-[100dvh] bg-[#FFFFFF] z-[100] pointer-events-auto overflow-y-auto flex flex-col shadow-2xl outline-none transition-transform ${
                isMenuVisible
                  ? 'translate-x-0 duration-[300ms] ease-out'
                  : '-translate-x-full duration-[250ms] ease-in-out'
              }`}
            >
              {/* 1. Top 56px row: logo on left, 44x44 close (X) button on right, followed by a hairline */}
              <div className="h-[56px] px-5 flex items-center justify-between border-b border-[#E6E6E6] shrink-0 bg-[#FFFFFF]">
                <span className="text-[18px] font-medium tracking-[0.16em] text-[#111111] uppercase font-['Jost']">
                  NUVMED
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-11 h-11 flex items-center justify-center text-[#111111] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] -mr-2"
                  aria-label="Close menu"
                >
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>

              {/* 2. Links: Shop, Providers, Contact as 56px rows, 18px weight 500, with a hairline between rows */}
              <nav className="divide-y divide-[#E6E6E6] shrink-0 bg-[#FFFFFF]" aria-label="Mobile Navigation">
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => {
                      onNavigate(link.route);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full h-[56px] px-5 flex items-center text-left text-[18px] font-medium text-[#111111] hover:text-[#666666] transition-colors duration-[150ms] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
                  >
                    {link.label}
                  </button>
                ))}
              </nav>

              {/* 3. Account pinned to bottom with 24px padding and safe-area padding */}
              <div
                className="mt-auto px-5 pt-4 border-t border-[#E6E6E6] shrink-0 bg-[#FFFFFF]"
                style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))' }}
              >
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full h-11 flex items-center gap-3 text-left text-[18px] font-medium text-[#111111] hover:text-[#666666] transition-colors duration-[150ms] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
                >
                  <User size={20} strokeWidth={1.5} />
                  <span>Account</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
