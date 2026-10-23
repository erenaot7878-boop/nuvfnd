import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export const ContactView: React.FC = () => {
  return (
    <div className="w-full max-w-[560px] mx-auto px-5 pt-8 sm:pt-16">
      {/* Title "Contact" at 32px, weight 500 */}
      <h1 className="text-[32px] font-medium text-[#111111] tracking-tight leading-tight font-['Jost']">
        Contact
      </h1>

      {/* Under it, one grey line (16px, #666): "Available 24/7 in all 50 states." */}
      <p className="mt-2 text-[16px] text-[#666666]">
        Available 24/7 in all 50 states.
      </p>

      {/* Below, 32px of space, then two large tappable rows */}
      <div className="mt-8 border-t border-b border-[#E6E6E6] divide-y divide-[#E6E6E6]">
        {/* Row 1: Phone */}
        <a
          href="tel:2147718020"
          className="w-full h-[72px] px-3 flex items-center justify-between text-left transition-colors duration-150 hover:bg-[#F5F5F5] active:bg-[#F5F5F5] focus-visible:outline-2 focus-visible:outline-[#111111] focus-visible:outline-offset-2"
        >
          <div className="flex flex-col justify-center min-w-0 pr-4">
            <span className="text-[14px] text-[#666666] leading-tight">
              Phone
            </span>
            <span className="text-[20px] font-medium text-[#111111] leading-snug">
              (214) 771-8020
            </span>
          </div>
          <ArrowUpRight
            size={20}
            strokeWidth={1.5}
            className="text-[#111111] shrink-0"
            aria-hidden="true"
          />
        </a>

        {/* Row 2: Email */}
        <a
          href="mailto:team@nuvmedhealth.com"
          className="w-full h-[72px] px-3 flex items-center justify-between text-left transition-colors duration-150 hover:bg-[#F5F5F5] active:bg-[#F5F5F5] focus-visible:outline-2 focus-visible:outline-[#111111] focus-visible:outline-offset-2"
        >
          <div className="flex flex-col justify-center min-w-0 pr-4">
            <span className="text-[14px] text-[#666666] leading-tight">
              Email
            </span>
            <span className="text-[20px] font-medium text-[#111111] leading-snug break-all sm:break-normal">
              team@nuvmedhealth.com
            </span>
          </div>
          <ArrowUpRight
            size={20}
            strokeWidth={1.5}
            className="text-[#111111] shrink-0"
            aria-hidden="true"
          />
        </a>
      </div>
    </div>
  );
};
