import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCart } from '../context/CartContext';

export const Toast: React.FC = () => {
  const { toastMessage } = useCart();
  const [visible, setVisible] = useState(false);
  const [renderedMessage, setRenderedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      setRenderedMessage(toastMessage);
      const showTimer = setTimeout(() => setVisible(true), 10);
      const hideTimer = setTimeout(() => setVisible(false), 2750);
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    } else {
      setVisible(false);
      const unmountTimer = setTimeout(() => {
        setRenderedMessage(null);
      }, 250);
      return () => clearTimeout(unmountTimer);
    }
  }, [toastMessage]);

  if (!renderedMessage) return null;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] px-5 py-3 bg-[#111111] text-white text-[14px] font-normal border border-[#111111] shadow-md pointer-events-none transition-opacity duration-[250ms] ease-[var(--ease-out)] ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <span>{renderedMessage}</span>
    </div>,
    document.body
  );
};
