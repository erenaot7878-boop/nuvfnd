import React, { useState, useEffect, useRef } from 'react';
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

  // Mobile menu mount/unmount timing (350ms open, 250ms close)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (mobileMenuOpen) {
      setIsMenuMounted(true);
      timer = setTimeout(() => setIsMenuVisible(true), 10);
    } else {
      setIsMenuVisible(false);
      timer = setTimeout(() => setIsMenuMounted(false), 250);
    }
    return () => clearTimeout(timer);
  }, [mobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [mobileMenuOpen]);

  // Scroll listener: >8px triggers border/shadow fade; mobile scroll hides/shows header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 8);

      if (currentScrollY <= 8 || mobileMenuOpen || isSearchOpen) {
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
    <header
      className={`sticky top-0 z-40 bg-[#FFFFFF] transition-transform duration-[250ms] ease-[var(--ease-in-out)] ${
        mobileHeaderVisible
          ? 'translate-y-0'
          : '-translate-y-full min-[900px]:translate-y-0'
      }`}
    >
      {/* 1px bottom border and very subtle shadow fading in only after user scrolls past 8px */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-[1px] bg-[#E6E6E6] shadow-[0_2px_4px_rgba(0,0,0,0.02)] pointer-events-none transition-opacity duration-[250ms] ease-[var(--ease-out)] ${
          isScrolled ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* DESKTOP HEADER (900px and up: 72px high) */}
      <div className="hidden min-[900px]:flex max-w-[1280px] mx-auto px-10 h-[72px] items-center justify-between">
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
                  {/* Underline grows from the left (transform: scaleX 0 to 1, origin-left, 250ms). Active keeps full underline */}
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

      {/* MOBILE HEADER (below 900px: 56px high) */}
      <div className="flex min-[900px]:hidden h-[56px] px-5 items-center justify-between w-full">
        {/* Left: Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="w-11 h-11 flex items-center justify-center text-[#111111] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
          aria-label="Open menu"
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

      {/* FULL-WIDTH SEARCH BAR (Expands in by fading and sliding down 8px over 250ms) */}
      {isSearchOpen && (
        <div
          ref={searchContainerRef}
          className="border-t border-[#E6E6E6] bg-[#FFFFFF] py-3 px-6 sm:px-10 animate-[pageEnter_250ms_var(--ease-out)_forwards]"
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
              className="flex-1 text-[15px] py-1 bg-transparent text-[#111111] placeholder-[#888888] outline-none"
            />
            <button
              type="submit"
              className="px-4 py-1.5 btn-primary text-[12px] font-medium cursor-pointer"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="w-9 h-9 flex items-center justify-center text-[#111111] hover:text-[#666666] transition-colors duration-[150ms] cursor-pointer"
              aria-label="Close search"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </form>
        </div>
      )}

      {/* MOBILE DRAWER: Slides in from left over 350ms --ease-out, overlay fades from 0 to rgba(0,0,0,0.4) over 250ms. On close: 250ms --ease-in-out */}
      {isMenuMounted && (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-[#000000]/40 transition-opacity duration-[250ms] ${
              isMenuVisible ? 'opacity-100 ease-[var(--ease-out)]' : 'opacity-0 ease-[var(--ease-in-out)]'
            }`}
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div
            className={`relative w-[280px] h-full bg-[#FFFFFF] border-r border-[#E6E6E6] flex flex-col justify-between p-6 z-10 shadow-lg transition-transform ${
              isMenuVisible
                ? 'translate-x-0 duration-[350ms] ease-[var(--ease-out)]'
                : '-translate-x-full duration-[250ms] ease-[var(--ease-in-out)]'
            }`}
          >
            <div>
              {/* Header with Close X */}
              <div className="flex items-center justify-between pb-6 border-b border-[#E6E6E6]">
                <span className="text-[18px] font-medium tracking-[0.16em] text-[#111111] uppercase font-['Jost']">
                  NUVMED
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-11 h-11 flex items-center justify-center text-[#111111] cursor-pointer -mr-2"
                  aria-label="Close menu"
                >
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>

              {/* 4 links in 18px rows */}
              <nav className="pt-4 divide-y divide-[#F5F5F5]">
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => {
                      onNavigate(link.route);
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left py-4 text-[18px] font-medium text-[#111111] hover:text-[#666666] transition-colors duration-[150ms] cursor-pointer"
                  >
                    {link.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Account at bottom */}
            <div className="pt-6 border-t border-[#E6E6E6]">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="w-full text-left py-3 text-[18px] font-medium text-[#111111] flex items-center gap-3 cursor-pointer hover:text-[#666666] transition-colors duration-[150ms]"
              >
                <User size={20} strokeWidth={1.5} />
                <span>Account</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
