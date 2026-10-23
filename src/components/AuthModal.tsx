import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useCart();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerRef = useRef<HTMLElement | null>(null);
  const modalPanelRef = useRef<HTMLDivElement>(null);

  // Animation lifecycle: fades in over 250ms, closes over 150ms
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
      setIsRendered(true);
      timer = setTimeout(() => {
        setIsVisible(true);
        modalPanelRef.current?.focus();
      }, 16);
    } else {
      setIsVisible(false);
      timer = setTimeout(() => {
        setIsRendered(false);
        triggerRef.current?.focus();
      }, 150);
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Lock html and body scroll
  useEffect(() => {
    if (isOpen) {
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyOverflow = document.body.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.overflow = originalBodyOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isRendered) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showToast(isRegister ? 'Account created.' : 'Signed in.');
      onClose();
    }, 600);
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isRegister ? 'Create an account' : 'Sign in'}
      className="fixed inset-0 pointer-events-none"
    >
      {/* Backdrop: z-[90], covers whole screen including header */}
      <div
        className={`fixed inset-0 bg-[#000000]/40 z-[90] pointer-events-auto transition-opacity ${
          isVisible
            ? 'opacity-100 duration-[250ms] ease-[var(--ease-out)]'
            : 'opacity-0 duration-[150ms] ease-[var(--ease-in-out)]'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog: z-[100], tabIndex -1 */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 overflow-y-auto pointer-events-none">
        <div
          ref={modalPanelRef}
          tabIndex={-1}
          className={`pointer-events-auto relative bg-[#FFFFFF] max-w-[440px] w-full p-8 sm:p-10 border border-[#E6E6E6] shadow-2xl outline-none transition-opacity ${
            isVisible
              ? 'opacity-100 duration-[250ms] ease-[var(--ease-out)]'
              : 'opacity-0 duration-[150ms] ease-[var(--ease-in-out)]'
          }`}
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-[#111111] hover:text-[#666666] transition-colors duration-[150ms] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
            aria-label="Close"
          >
            <X size={20} strokeWidth={1.5} />
          </button>

          <h2 className="text-[24px] font-medium tracking-tight text-[#111111] font-['Jost'] mb-6">
            {isRegister ? 'Create an account' : 'Sign in'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[14px] text-[#111111] font-normal">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="name@example.com"
                className={`w-full h-12 px-4 border rounded-none text-[14px] text-[#111111] placeholder-[#999999] outline-none transition-colors duration-[150ms] ease-[var(--ease-out)] ${
                  error
                    ? 'border-red-600 focus:border-red-600'
                    : 'border-[#DDDDDD] focus:border-[#111111]'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[14px] text-[#111111] font-normal">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter password"
                className={`w-full h-12 px-4 border rounded-none text-[14px] text-[#111111] placeholder-[#999999] outline-none transition-colors duration-[150ms] ease-[var(--ease-out)] ${
                  error
                    ? 'border-red-600 focus:border-red-600'
                    : 'border-[#DDDDDD] focus:border-[#111111]'
                }`}
              />
            </div>

            {/* Inline error message */}
            {error && (
              <div className="animate-error-enter text-[13px] text-red-600 font-normal">
                {error}
              </div>
            )}

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full h-12 text-[11px] uppercase tracking-[0.14em] font-medium cursor-pointer relative flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
              >
                <span className={`transition-opacity duration-[150ms] ${isLoading ? 'opacity-25' : 'opacity-100'}`}>
                  {isRegister ? 'CREATE ACCOUNT' : 'SIGN IN'}
                </span>
                {isLoading && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="form-spinner text-white" />
                  </span>
                )}
              </button>
            </div>

            <div className="pt-2 flex items-center justify-between text-[14px] text-[#666666]">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError(null);
                }}
                className="hover:text-[#111111] underline underline-offset-4 transition-colors duration-[150ms] cursor-pointer"
              >
                {isRegister ? 'Already have an account? Sign in' : 'New here? Create an account'}
              </button>
              {!isRegister && (
                <button
                  type="button"
                  onClick={() => showToast('Password reset link sent.')}
                  className="hover:text-[#111111] underline underline-offset-4 transition-colors duration-[150ms] cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};
