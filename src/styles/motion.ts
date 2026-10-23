/**
 * MOTION SYSTEM TOKENS & UTILITIES
 * Defined once here and in src/index.css, used across the entire application.
 *
 * Rules:
 * - Only animate opacity and transform (and background-color / color for hovers).
 * - Never animate width, height, top, left, margin or box-shadow.
 * - Never use "transition: all".
 * - Respect prefers-reduced-motion.
 */

import { useEffect, useRef } from 'react';

export const MOTION = {
  // Easings
  easeOut: 'cubic-bezier(0.22, 1, 0.36, 1)',
  easeInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',

  // Durations
  dFast: '150ms', // Hover, press
  dBase: '250ms', // Fades, small moves
  dSlow: '450ms', // Page and section reveals, drawers
} as const;

/**
 * Hook for single-trigger scroll reveal on enter using IntersectionObserver.
 * threshold: 0.15, rootMargin: '0px 0px -8% 0px'.
 * Content remains visible if JS or observer fails.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(staggerIndex = 0) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('is-revealed');
      return;
    }

    // If element is already within the initial viewport on load, reveal immediately without late delay
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add('is-revealed');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -8% 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [staggerIndex]);

  return ref;
}
