import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { OrderDetails } from '../types';

interface CheckoutViewProps {
  onNavigate: (route: string) => void;
  onOpenCart: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  onNavigate,
  onOpenCart,
}) => {
  const { cart, cartTotal, clearCart, setRecentOrder, showToast } = useCart();

  // If cart is empty, redirect to shop
  useEffect(() => {
    if (cart.length === 0 && !confirmedOrder) {
      showToast('Your cart is empty.');
      onNavigate('#/shop');
    }
  }, [cart, onNavigate, showToast]);

  // Form fields
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('CA');
  const [zip, setZip] = useState('');
  const [phone, setPhone] = useState('');

  // Clinician intake
  const [dob, setDob] = useState('');
  const [allergies, setAllergies] = useState('None');
  const [attestation, setAttestation] = useState(false);

  // Payment
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // Validation & errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderDetails | null>(null);

  // Mobile order summary collapse
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  // Refs for scrolling to first error
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});
  const setFieldRef = (name: string) => (el: HTMLElement | null) => {
    fieldRefs.current[name] = el;
  };

  const hasPrescription = cart.length > 0;

  // Validation function
  const validateField = (field: string, val?: any): string => {
    switch (field) {
      case 'email': {
        const v = val !== undefined ? val : email;
        if (!v || !v.trim()) return 'Enter an email address';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email';
        return '';
      }
      case 'name': {
        const v = val !== undefined ? val : name;
        if (!v || !v.trim()) return 'Enter your full name';
        return '';
      }
      case 'address': {
        const v = val !== undefined ? val : address;
        if (!v || !v.trim()) return 'Enter your street address';
        return '';
      }
      case 'city': {
        const v = val !== undefined ? val : city;
        if (!v || !v.trim()) return 'Enter your city';
        return '';
      }
      case 'state': {
        const v = val !== undefined ? val : state;
        if (!v || !v.trim()) return 'Select your state';
        return '';
      }
      case 'zip': {
        const v = val !== undefined ? val : zip;
        if (!v || !v.trim()) return 'Enter your postal code';
        if (v.trim().length < 4) return 'Enter a valid postal code';
        return '';
      }
      case 'phone': {
        const v = val !== undefined ? val : phone;
        if (!v || !v.trim()) return 'Enter a phone number';
        if (v.replace(/\D/g, '').length < 8) return 'Enter a valid phone number';
        return '';
      }
      case 'dob': {
        if (!hasPrescription) return '';
        const v = val !== undefined ? val : dob;
        if (!v) return 'Enter your date of birth';
        return '';
      }
      case 'attestation': {
        if (!hasPrescription) return '';
        const v = val !== undefined ? val : attestation;
        if (!v) return 'Confirm clinical review attestation';
        return '';
      }
      case 'cardNumber': {
        const v = (val !== undefined ? val : cardNumber).replace(/\s+/g, '');
        if (!v) return 'Enter a card number';
        if (v.length < 12) return 'Enter a valid card number';
        return '';
      }
      case 'cardExp': {
        const v = val !== undefined ? val : cardExp;
        if (!v || !v.trim()) return 'Enter expiration date (MM/YY)';
        return '';
      }
      case 'cardCvc': {
        const v = val !== undefined ? val : cardCvc;
        if (!v || !v.trim()) return 'Enter security code';
        if (v.trim().length < 3) return 'Enter a valid security code';
        return '';
      }
      default:
        return '';
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errorMsg = validateField(field);
    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate all fields
    const requiredFields = [
      'email',
      'name',
      'address',
      'city',
      'state',
      'zip',
      'phone',
      ...(hasPrescription ? ['dob', 'attestation'] : []),
      'cardNumber',
      'cardExp',
      'cardCvc',
    ];

    const newErrors: Record<string, string> = {};
    let firstErrorField: string | null = null;

    for (const f of requiredFields) {
      const err = validateField(f);
      if (err) {
        newErrors[f] = err;
        if (!firstErrorField) firstErrorField = f;
      }
    }

    setErrors(newErrors);
    setTouched(
      requiredFields.reduce((acc, f) => ({ ...acc, [f]: true }), {})
    );

    if (firstErrorField) {
      const targetEl = fieldRefs.current[firstErrorField];
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetEl.focus();
      }
      return;
    }

    // Submit order
    setIsSubmitting(true);
    setTimeout(() => {
      const randomOrderNum = Math.floor(10000 + Math.random() * 90000);
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 2);

      const order: OrderDetails = {
        orderId: `NM-${randomOrderNum}`,
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        items: [...cart],
        subtotal: cartTotal,
        shipping: 0,
        total: cartTotal,
        patientName: name,
        email,
        phone,
        shippingAddress: {
          street: address,
          city,
          state,
          zip,
        },
        deliveryEst: deliveryDate.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
      };

      setConfirmedOrder(order);
      setRecentOrder(order);
      clearCart();
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 900);
  };

  if (cart.length === 0 && !confirmedOrder) {
    return null;
  }

  // Order Confirmed State
  if (confirmedOrder) {
    return (
      <div className="min-h-screen bg-[#FFFFFF]">
        <header className="border-b border-[#E6E6E6] h-16 px-6 flex items-center justify-between">
          <span className="text-[18px] font-medium tracking-[0.16em] uppercase font-['Jost']">
            NUVMED
          </span>
          <button
            onClick={() => onNavigate('#/shop')}
            className="text-[14px] text-[#666666] hover:text-[#111111]"
          >
            Back to shop
          </button>
        </header>

        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-16 space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-medium tracking-tight text-[#111111] font-['Jost']">
              Order {confirmedOrder.orderId} placed
            </h1>
            <p className="text-[14px] text-[#666666]">
              A confirmation email has been sent to {confirmedOrder.email}.
            </p>
          </div>

          <div className="border border-[#E6E6E6] p-6 space-y-4">
            <div className="flex justify-between text-[14px] pb-3 border-b border-[#E6E6E6]">
              <span className="text-[#666666]">Delivery estimate</span>
              <span className="font-medium text-[#111111]">
                {confirmedOrder.deliveryEst}
              </span>
            </div>

            <div className="space-y-2">
              {confirmedOrder.items.map((it) => (
                <div
                  key={it.variantId}
                  className="flex justify-between text-[14px]"
                >
                  <span className="text-[#111111]">
                    {it.productTitle} × {it.qty}
                  </span>
                  <span className="tabular-nums font-medium text-[#111111]">
                    ${(Number(it.price) * it.qty).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#E6E6E6] flex justify-between text-[18px] font-medium text-[#111111]">
              <span>Total</span>
              <span className="tabular-nums">
                ${confirmedOrder.total.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('#/shop')}
            className="w-full h-[52px] bg-[#111111] text-white font-medium text-[14px] hover:bg-[#222222] transition-colors cursor-pointer"
          >
            Return to shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111]">
      {/* Simple Header with logo and Return to cart link */}
      <header className="border-b border-[#E6E6E6] h-16 px-6 sm:px-10 flex items-center justify-between sticky top-0 bg-[#FFFFFF] z-20">
        <button
          type="button"
          onClick={() => {
            onNavigate('#/shop');
            onOpenCart();
          }}
          className="text-[14px] text-[#666666] hover:text-[#111111] transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          <span>Return to cart</span>
        </button>

        <button
          onClick={() => onNavigate('#/')}
          className="cursor-pointer"
          aria-label="Nuvmed Home"
        >
          <span className="text-[18px] font-medium tracking-[0.16em] uppercase font-['Jost']">
            NUVMED
          </span>
        </button>

        <div className="w-20" />
      </header>

      {/* MOBILE COLLAPSIBLE ORDER SUMMARY ROW AT TOP */}
      <div className="block lg:hidden border-b border-[#E6E6E6] bg-[#F5F5F5]">
        <button
          type="button"
          onClick={() => setSummaryExpanded(!summaryExpanded)}
          className="w-full px-6 py-4 flex items-center justify-between text-[14px] text-[#111111] cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <span>{summaryExpanded ? 'Hide' : 'Show'} order summary</span>
            {summaryExpanded ? (
              <ChevronUp size={16} strokeWidth={1.5} />
            ) : (
              <ChevronDown size={16} strokeWidth={1.5} />
            )}
          </span>
          <span className="text-[18px] font-medium tabular-nums">
            ${cartTotal.toFixed(2)}
          </span>
        </button>

        {summaryExpanded && (
          <div className="px-6 pb-6 space-y-4 border-t border-[#E6E6E6] pt-4">
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.variantId}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-white border border-[#E6E6E6] p-1 rounded-[4px] shrink-0 flex items-center justify-center overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productTitle}
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      ) : (
                        <span className="text-[12px] text-[#777]">Rx</span>
                      )}
                    </div>
                    <div>
                      <div className="text-[14px] font-medium text-[#111111]">
                        {item.productTitle}
                      </div>
                      <div className="text-[12px] text-[#666666]">
                        Qty: {item.qty}
                      </div>
                    </div>
                  </div>
                  <span className="text-[14px] font-medium tabular-nums">
                    ${(Number(item.price) * item.qty).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#E6E6E6] space-y-1.5 text-[14px]">
              <div className="flex justify-between text-[#666666]">
                <span>Subtotal</span>
                <span className="tabular-nums text-[#111111]">
                  ${cartTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-[#666666]">
                <span>Shipping</span>
                <span className="text-[#111111]">Included</span>
              </div>
              <div className="flex justify-between text-[18px] font-medium text-[#111111] pt-2 border-t border-[#E6E6E6]">
                <span>Total</span>
                <span className="tabular-nums">${cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MAIN TWO-COLUMN CHECKOUT LAYOUT (Form 60% Left, Summary 40% Right) */}
      <main className="w-full max-w-[1280px] mx-auto px-5 sm:px-10 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Form (60% -> 7 of 12 cols) */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} noValidate className="space-y-10">
              {/* SECTION 1: Contact */}
              <div className="space-y-4">
                <h2 className="text-[20px] font-medium text-[#111111]">
                  Contact
                </h2>

                <div className="space-y-1.5">
                  <label
                    htmlFor="checkout-email"
                    className="block text-[14px] text-[#111111]"
                  >
                    Email address
                  </label>
                  <input
                    id="checkout-email"
                    ref={setFieldRef('email')}
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => handleBlur('email')}
                    className={`w-full h-12 px-4 text-[16px] border rounded-[4px] outline-none transition-colors ${
                      touched.email && errors.email
                        ? 'border-red-600 focus:border-red-600'
                        : 'border-[#DDDDDD] focus:border-[#111111]'
                    }`}
                  />
                  {touched.email && errors.email && (
                    <p className="text-red-600 text-[13px]">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* SECTION 2: Delivery */}
              <div className="space-y-4 pt-6 border-t border-[#E6E6E6]">
                <h2 className="text-[20px] font-medium text-[#111111]">
                  Delivery
                </h2>

                <div className="space-y-4">
                  {/* Full legal name */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="checkout-name"
                      className="block text-[14px] text-[#111111]"
                    >
                      Full legal name
                    </label>
                    <input
                      id="checkout-name"
                      ref={setFieldRef('name')}
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => handleBlur('name')}
                      className={`w-full h-12 px-4 text-[16px] border rounded-[4px] outline-none transition-colors ${
                        touched.name && errors.name
                          ? 'border-red-600 focus:border-red-600'
                          : 'border-[#DDDDDD] focus:border-[#111111]'
                      }`}
                    />
                    {touched.name && errors.name && (
                      <p className="text-red-600 text-[13px]">{errors.name}</p>
                    )}
                  </div>

                  {/* Street address */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="checkout-address"
                      className="block text-[14px] text-[#111111]"
                    >
                      Address
                    </label>
                    <input
                      id="checkout-address"
                      ref={setFieldRef('address')}
                      type="text"
                      autoComplete="address-line1"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      onBlur={() => handleBlur('address')}
                      className={`w-full h-12 px-4 text-[16px] border rounded-[4px] outline-none transition-colors ${
                        touched.address && errors.address
                          ? 'border-red-600 focus:border-red-600'
                          : 'border-[#DDDDDD] focus:border-[#111111]'
                      }`}
                    />
                    {touched.address && errors.address && (
                      <p className="text-red-600 text-[13px]">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  {/* City, State, Postal code in grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="checkout-city"
                        className="block text-[14px] text-[#111111]"
                      >
                        City
                      </label>
                      <input
                        id="checkout-city"
                        ref={setFieldRef('city')}
                        type="text"
                        autoComplete="address-level2"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        onBlur={() => handleBlur('city')}
                        className={`w-full h-12 px-4 text-[16px] border rounded-[4px] outline-none transition-colors ${
                          touched.city && errors.city
                            ? 'border-red-600 focus:border-red-600'
                            : 'border-[#DDDDDD] focus:border-[#111111]'
                        }`}
                      />
                      {touched.city && errors.city && (
                        <p className="text-red-600 text-[13px]">{errors.city}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="checkout-state"
                        className="block text-[14px] text-[#111111]"
                      >
                        State
                      </label>
                      <select
                        id="checkout-state"
                        ref={setFieldRef('state')}
                        autoComplete="address-level1"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        onBlur={() => handleBlur('state')}
                        className="w-full h-12 px-4 text-[16px] border border-[#DDDDDD] rounded-[4px] outline-none bg-white focus:border-[#111111]"
                      >
                        {[
                          'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
                          'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
                          'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
                          'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
                          'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
                        ].map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="checkout-zip"
                        className="block text-[14px] text-[#111111]"
                      >
                        Postal code
                      </label>
                      <input
                        id="checkout-zip"
                        ref={setFieldRef('zip')}
                        type="text"
                        autoComplete="postal-code"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        onBlur={() => handleBlur('zip')}
                        className={`w-full h-12 px-4 text-[16px] border rounded-[4px] outline-none transition-colors ${
                          touched.zip && errors.zip
                            ? 'border-red-600 focus:border-red-600'
                            : 'border-[#DDDDDD] focus:border-[#111111]'
                        }`}
                      />
                      {touched.zip && errors.zip && (
                        <p className="text-red-600 text-[13px]">{errors.zip}</p>
                      )}
                    </div>
                  </div>

                  {/* Phone number */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="checkout-phone"
                      className="block text-[14px] text-[#111111]"
                    >
                      Phone number
                    </label>
                    <input
                      id="checkout-phone"
                      ref={setFieldRef('phone')}
                      type="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onBlur={() => handleBlur('phone')}
                      className={`w-full h-12 px-4 text-[16px] border rounded-[4px] outline-none transition-colors ${
                        touched.phone && errors.phone
                          ? 'border-red-600 focus:border-red-600'
                          : 'border-[#DDDDDD] focus:border-[#111111]'
                      }`}
                    />
                    {touched.phone && errors.phone && (
                      <p className="text-red-600 text-[13px]">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 3: Clinician intake (only if cart has prescription products) */}
              {hasPrescription && (
                <div className="space-y-4 pt-6 border-t border-[#E6E6E6]">
                  <div className="space-y-1">
                    <h2 className="text-[20px] font-medium text-[#111111]">
                      Clinician intake
                    </h2>
                    <p className="text-[14px] text-[#666666]">
                      A licensed clinician evaluates your medical intake before compounding release.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="checkout-dob"
                        className="block text-[14px] text-[#111111]"
                      >
                        Date of birth
                      </label>
                      <input
                        id="checkout-dob"
                        ref={setFieldRef('dob')}
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        onBlur={() => handleBlur('dob')}
                        className={`w-full h-12 px-4 text-[16px] border rounded-[4px] outline-none transition-colors ${
                          touched.dob && errors.dob
                            ? 'border-red-600 focus:border-red-600'
                            : 'border-[#DDDDDD] focus:border-[#111111]'
                        }`}
                      />
                      {touched.dob && errors.dob && (
                        <p className="text-red-600 text-[13px]">{errors.dob}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="checkout-allergies"
                        className="block text-[14px] text-[#111111]"
                      >
                        Allergies or current medications
                      </label>
                      <input
                        id="checkout-allergies"
                        type="text"
                        value={allergies}
                        onChange={(e) => setAllergies(e.target.value)}
                        className="w-full h-12 px-4 text-[16px] border border-[#DDDDDD] rounded-[4px] outline-none focus:border-[#111111]"
                      />
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <label
                        htmlFor="checkout-attestation"
                        className="flex items-start gap-3 cursor-pointer text-[14px] text-[#111111]"
                      >
                        <input
                          id="checkout-attestation"
                          ref={setFieldRef('attestation')}
                          type="checkbox"
                          checked={attestation}
                          onChange={(e) => {
                            setAttestation(e.target.checked);
                            if (touched.attestation) {
                              setErrors((prev) => ({
                                ...prev,
                                attestation: e.target.checked
                                  ? ''
                                  : 'Confirm clinical review attestation',
                              }));
                            }
                          }}
                          className="w-4 h-4 mt-0.5 accent-[#111111] cursor-pointer"
                        />
                        <span>
                          I confirm I am 18 years or older and provide accurate health history for prescription review.
                        </span>
                      </label>
                      {touched.attestation && errors.attestation && (
                        <p className="text-red-600 text-[13px]">
                          {errors.attestation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: Payment */}
              <div className="space-y-4 pt-6 border-t border-[#E6E6E6]">
                <h2 className="text-[20px] font-medium text-[#111111]">
                  Payment
                </h2>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="checkout-card"
                      className="block text-[14px] text-[#111111]"
                    >
                      Card number
                    </label>
                    <input
                      id="checkout-card"
                      ref={setFieldRef('cardNumber')}
                      type="text"
                      autoComplete="cc-number"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      onBlur={() => handleBlur('cardNumber')}
                      className={`w-full h-12 px-4 text-[16px] border rounded-[4px] outline-none transition-colors ${
                        touched.cardNumber && errors.cardNumber
                          ? 'border-red-600 focus:border-red-600'
                          : 'border-[#DDDDDD] focus:border-[#111111]'
                      }`}
                    />
                    {touched.cardNumber && errors.cardNumber && (
                      <p className="text-red-600 text-[13px]">
                        {errors.cardNumber}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="checkout-exp"
                        className="block text-[14px] text-[#111111]"
                      >
                        Expiration
                      </label>
                      <input
                        id="checkout-exp"
                        ref={setFieldRef('cardExp')}
                        type="text"
                        autoComplete="cc-exp"
                        placeholder="MM/YY"
                        value={cardExp}
                        onChange={(e) => setCardExp(e.target.value)}
                        onBlur={() => handleBlur('cardExp')}
                        className={`w-full h-12 px-4 text-[16px] border rounded-[4px] outline-none transition-colors ${
                          touched.cardExp && errors.cardExp
                            ? 'border-red-600 focus:border-red-600'
                            : 'border-[#DDDDDD] focus:border-[#111111]'
                        }`}
                      />
                      {touched.cardExp && errors.cardExp && (
                        <p className="text-red-600 text-[13px]">
                          {errors.cardExp}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="checkout-cvc"
                        className="block text-[14px] text-[#111111]"
                      >
                        Security code
                      </label>
                      <input
                        id="checkout-cvc"
                        ref={setFieldRef('cardCvc')}
                        type="text"
                        autoComplete="cc-csc"
                        placeholder="CVC"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        onBlur={() => handleBlur('cardCvc')}
                        className={`w-full h-12 px-4 text-[16px] border rounded-[4px] outline-none transition-colors ${
                          touched.cardCvc && errors.cardCvc
                            ? 'border-red-600 focus:border-red-600'
                            : 'border-[#DDDDDD] focus:border-[#111111]'
                        }`}
                      />
                      {touched.cardCvc && errors.cardCvc && (
                        <p className="text-red-600 text-[13px]">
                          {errors.cardCvc}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Primary submit button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-[52px] bg-[#111111] hover:bg-[#222222] text-white font-medium text-[14px] rounded-[4px] transition-colors cursor-pointer flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Processing order…' : `Pay $${cartTotal.toFixed(2)}`}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Order Summary (40% -> 5 of 12 cols, sticky on desktop) */}
          <div className="hidden lg:block lg:col-span-5 lg:sticky lg:top-24">
            <div className="border border-[#E6E6E6] p-6 space-y-6">
              <h2 className="text-[20px] font-medium text-[#111111]">
                Order summary
              </h2>

              {/* Line items with small 56px thumbnail, name, quantity, price right-aligned */}
              <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.variantId}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-[56px] h-[56px] bg-[#F5F5F5] rounded-[4px] p-1.5 shrink-0 flex items-center justify-center overflow-hidden">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.productTitle}
                            className="w-full h-full object-contain mix-blend-multiply"
                          />
                        ) : (
                          <span className="text-[12px] text-[#777]">Rx</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[14px] font-medium text-[#111111] truncate">
                          {item.productTitle}
                        </div>
                        <div className="text-[13px] text-[#666666]">
                          Qty: {item.qty}
                        </div>
                      </div>
                    </div>
                    <span className="text-[14px] font-medium text-[#111111] tabular-nums shrink-0">
                      ${(Number(item.price) * item.qty).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Subtotal, Shipping, Total (20px) */}
              <div className="pt-4 border-t border-[#E6E6E6] space-y-2 text-[14px]">
                <div className="flex justify-between text-[#666666]">
                  <span>Subtotal</span>
                  <span className="tabular-nums text-[#111111]">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-[#666666]">
                  <span>Shipping</span>
                  <span className="text-[#111111]">Included</span>
                </div>
                <div className="flex justify-between text-[20px] font-medium text-[#111111] pt-3 border-t border-[#E6E6E6]">
                  <span>Total</span>
                  <span className="tabular-nums">${cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
