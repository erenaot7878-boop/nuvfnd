import React from 'react';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-[#E6E6E6] bg-[#FFFFFF] pt-16 pb-8 mt-16 w-full">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-10 space-y-8 md:space-y-12">
        {/* On desktop: flex row. On mobile: stacked column with 32px between groups */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 md:gap-10">
          {/* Group 1: Brand and description */}
          <div className="max-w-md space-y-2 text-left">
            <button
              onClick={() => onNavigate('#/')}
              className="text-[20px] font-medium tracking-[0.16em] text-[#111111] uppercase font-['Jost'] cursor-pointer text-left block"
            >
              Nuvmed Health
            </button>
            <p className="text-[14px] text-[#666666] leading-relaxed">
              Modern, physician-led telehealth for weight loss, men's health, peptide therapy and everyday primary care, delivered to your door.
            </p>
          </div>

          {/* Group 2 & Group 3: Links and Contact */}
          <div className="flex flex-col sm:flex-row gap-8 sm:gap-16 text-left">
            {/* Group 2: Links */}
            <div className="space-y-2 text-[14px]">
              <div>
                <button
                  onClick={() => onNavigate('#/shop')}
                  className="text-[#666666] hover:text-[#111111] transition-colors cursor-pointer text-left"
                >
                  Shop
                </button>
              </div>
              <div>
                <button
                  onClick={() => onNavigate('#/providers')}
                  className="text-[#666666] hover:text-[#111111] transition-colors cursor-pointer text-left"
                >
                  Providers
                </button>
              </div>
              <div>
                <button
                  onClick={() => onNavigate('#/contact')}
                  className="text-[#666666] hover:text-[#111111] transition-colors cursor-pointer text-left"
                >
                  Contact
                </button>
              </div>
            </div>

            {/* Group 3: Contact */}
            <div className="space-y-1.5 text-[14px] text-[#666666] text-left">
              <div>
                <a
                  href="tel:2147718020"
                  className="hover:text-[#111111] transition-colors"
                >
                  (214) 771-8020
                </a>
              </div>
              <div>
                <a
                  href="mailto:team@nuvmedhealth.com"
                  className="hover:text-[#111111] transition-colors break-all"
                >
                  team@nuvmedhealth.com
                </a>
              </div>
              <div>Available 24/7</div>
              <div>Available in all 50 states</div>
            </div>
          </div>
        </div>

        {/* Group 4: Bottom row */}
        <div className="border-t border-[#E6E6E6] pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[14px] text-[#666666] text-left">
          <div>
            © 2026 Nuvmed
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('#/privacy')}
              className="hover:text-[#111111] transition-colors cursor-pointer"
            >
              Privacy policy
            </button>
            <button
              onClick={() => onNavigate('#/terms')}
              className="hover:text-[#111111] transition-colors cursor-pointer"
            >
              Terms of service
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
