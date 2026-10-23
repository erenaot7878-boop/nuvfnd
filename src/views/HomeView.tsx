import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Product } from '../types';
import { ProductCard, ProductCardSkeleton } from '../components/ProductCard';
import { useScrollReveal } from '../styles/motion';

interface HomeViewProps {
  featuredProducts: Product[];
  isLoading: boolean;
  onNavigate: (route: string) => void;
  onSelectProduct: (handle: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  featuredProducts,
  isLoading,
  onNavigate,
  onSelectProduct,
}) => {
  // Hero image fade-in state
  const [isHeroImageLoaded, setIsHeroImageLoaded] = useState<boolean>(false);

  // Fallback timer so cached image smoothly displays without remaining blank
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHeroImageLoaded(true);
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  const heroImageUrl =
    'https://github.com/erenaot7878-boop/nuv/blob/main/Pink%20Yellow%20and%20White%20Modern%20Doctor%20Consultation%20Your%20Story%20(1080%20x%201500%20px)%20(1080%20x%201080%20px).png?raw=true';

  // Scroll reveal refs for below-the-fold sections
  const categoryRowRef = useScrollReveal<HTMLElement>();
  const featuredHeaderRef = useScrollReveal<HTMLDivElement>();
  const providersSectionRef = useScrollReveal<HTMLElement>();

  // 4 category links: First 3 filter Shop, Primary care routes to Providers
  const categoryLinks = [
    {
      label: 'Weight loss',
      onClick: () => onNavigate('#/shop?tag=weight-loss'),
      borderClasses: 'border-r border-b md:border-b-0 border-[#E6E6E6]',
    },
    {
      label: "Men's health",
      onClick: () => onNavigate('#/shop?tag=mens-health'),
      borderClasses: 'md:border-r border-b md:border-b-0 border-[#E6E6E6]',
    },
    {
      label: 'Peptide therapy',
      onClick: () => onNavigate('#/shop?tag=peptides'),
      borderClasses: 'border-r border-[#E6E6E6]',
    },
    {
      label: 'Primary care',
      onClick: () => onNavigate('#/providers'),
      borderClasses: '',
    },
  ];

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 min-[360px]:px-5 lg:px-10 pt-2 pb-16 space-y-12 sm:space-y-16">
      
      {/* Hero Section:
          Desktop (>= 1024px): Two 50/50 columns, vertically centered, 64px gap, max height 640px.
          Appears with a single 450ms fade, with headline, sentence and buttons staggered by 80ms. */}
      <section className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-16 lg:h-[640px] lg:items-center">
        
        {/* Image Panel: Single 450ms fade-in */}
        <div className="hero-panel-fade order-1 lg:order-2 w-full bg-[#F5F5F5] rounded-[8px] aspect-[4/3] lg:aspect-auto lg:h-[640px] overflow-hidden flex items-center justify-center">
          <img
            src={heroImageUrl}
            alt="Physician consultation"
            onLoad={() => setIsHeroImageLoaded(true)}
            className={`w-full h-full object-cover select-none transition-opacity duration-[250ms] ease-[var(--ease-out)] ${
              isHeroImageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>

        {/* Copy Column:
            Order 2 on mobile (after image), Order 1 on desktop (left column). */}
        <div className="order-2 lg:order-1 flex flex-col justify-center mt-8 lg:mt-0">
          
          {/* 1. Headline (stagger 0ms) */}
          <h1 className="hero-stagger-1 text-[36px] lg:text-[56px] font-medium leading-[1.1] lg:leading-[1.05] tracking-[-0.02em] text-[#111111] font-['Jost']">
            Physician-led care, delivered to your door.
          </h1>

          {/* 2. One sentence (stagger 80ms) */}
          <p className="hero-stagger-2 mt-4 lg:mt-6 text-[16px] lg:text-[18px] leading-[1.6] text-[#666666] max-w-[440px] font-normal">
            Weight loss, men's health, peptide therapy and everyday primary care from licensed providers.
          </p>

          {/* 3. Primary button "Shop" + "Meet our providers" text link (stagger 160ms) */}
          <div className="hero-stagger-3 mt-6 lg:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 lg:gap-6">
            <button
              onClick={() => onNavigate('#/shop')}
              className="btn-primary w-full sm:w-auto h-[52px] rounded-[8px] text-[14px] font-medium px-8 flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
            >
              Shop
            </button>

            <button
              onClick={() => onNavigate('#/providers')}
              className="link-arrow inline-flex items-center justify-center sm:justify-start gap-2 text-[14px] font-medium text-[#111111] hover:underline cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
            >
              <span>Meet our providers</span>
              <ArrowRight className="arrow-icon w-5 h-5 text-[#111111]" strokeWidth={1.5} />
            </button>
          </div>

          {/* 4. Availability line (stagger 240ms) */}
          <p className="hero-stagger-4 mt-5 lg:mt-8 text-[14px] text-[#666666] text-left">
            Available 24/7 in all 50 states.
          </p>

        </div>

      </section>

      {/* Category Row (directly under hero):
          Fade in and move up 16px over 450ms with --ease-out */}
      <nav
        ref={categoryRowRef}
        aria-label="Product categories"
        className="reveal-block w-full border-y border-[#E6E6E6]"
      >
        <div className="grid grid-cols-2 md:grid-cols-4">
          {categoryLinks.map((cat) => (
            <button
              key={cat.label}
              onClick={cat.onClick}
              className={`h-[64px] md:h-[80px] flex items-center justify-between px-4 sm:px-6 w-full text-left transition-colors duration-[150ms] hover:bg-[#F5F5F5] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] cursor-pointer ${cat.borderClasses}`}
            >
              <span className="text-[16px] md:text-[18px] font-medium text-[#111111] font-['Jost']">
                {cat.label}
              </span>
              <ArrowUpRight className="w-5 h-5 text-[#111111] shrink-0" strokeWidth={1.5} />
            </button>
          ))}
        </div>
      </nav>

      {/* Featured Formulations: Separated by clean whitespace */}
      <section className="space-y-8 pt-4">
        <div
          ref={featuredHeaderRef}
          className="reveal-block border-b border-[#E6E6E6] pb-4 flex items-end justify-between"
        >
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#111111] font-['Jost']">
            Featured formulations
          </h2>
          <button
            onClick={() => onNavigate('#/shop')}
            className="text-[13px] font-medium text-[#111111] underline underline-offset-4 hover:text-[#666666] transition-colors duration-[150ms] cursor-pointer"
          >
            All products
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] min-[600px]:grid-cols-[repeat(3,minmax(0,1fr))] lg:grid-cols-[repeat(4,minmax(0,1fr))] gap-x-[10px] min-[360px]:gap-x-[12px] min-[600px]:gap-x-[20px] lg:gap-x-[24px] gap-y-[28px] lg:gap-y-[32px] items-stretch">
            {[...Array(4)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] min-[600px]:grid-cols-[repeat(3,minmax(0,1fr))] lg:grid-cols-[repeat(4,minmax(0,1fr))] gap-x-[10px] min-[360px]:gap-x-[12px] min-[600px]:gap-x-[20px] lg:gap-x-[24px] gap-y-[28px] lg:gap-y-[32px] items-stretch">
            {featuredProducts.slice(0, 8).map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
                staggerIndex={i}
              />
            ))}
          </div>
        )}
      </section>

      {/* Our Providers Section: Plain text, scroll reveal block */}
      <section
        ref={providersSectionRef}
        className="reveal-block border-t border-[#E6E6E6] pt-12 sm:pt-16 space-y-4 max-w-2xl"
      >
        <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#111111] font-['Jost']">
          Our providers
        </h2>
        <p className="text-[18px] text-[#111111] font-medium">
          Qualified professionals. Care built around you.
        </p>
        <p className="text-[16px] text-[#666666] leading-[1.7]">
          Our providers bring the training, credentials, and clinical experience needed to support your care. We verify their qualifications and licensure before they join Nuvmed.
        </p>
        <div className="pt-2">
          <button
            onClick={() => onNavigate('#/providers')}
            className="text-[14px] text-[#111111] font-medium underline underline-offset-4 hover:text-[#666666] transition-colors duration-[150ms] cursor-pointer"
          >
            Meet our providers
          </button>
        </div>
      </section>

    </div>
  );
};
