import React, { useState, useEffect } from 'react';
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

  // Animation lifecycle: fades in & moves up 8px over 250ms, closes with fade over 150ms
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isOpen) {
      setIsRendered(true);
      timer = setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      timer = setTimeout(() => setIsRendered(false), 150);
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

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

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop: fades in 250ms, fades out 150ms */}
      <div
        className={`fixed inset-0 bg-[#000000]/40 transition-opacity ${
          isVisible
            ? 'opacity-100 duration-[250ms] ease-[var(--ease-out)]'
            : 'opacity-0 duration-[150ms] ease-[var(--ease-in-out)]'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog: fades in & moves up 8px over 250ms, closes over 150ms */}
      <div
        className={`relative bg-[#FFFFFF] max-w-[440px] w-full p-8 sm:p-10 z-10 border border-[#E6E6E6] transition-all ${
          isVisible
            ? 'opacity-100 translate-y-0 duration-[250ms] ease-[var(--ease-out)]'
            : 'opacity-0 translate-y-2 duration-[150ms] ease-[var(--ease-in-out)]'
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

          {/* Inline error message: fades in & moves down 4px over 200ms */}
          {error && (
            <div className="animate-error-enter text-[13px] text-red-600 font-normal">
              {error}
            </div>
          )}

          {/* Submit button: size stays 48px, shows 16px 700ms linear spinner when loading, label dimmed */}
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
  );
};
