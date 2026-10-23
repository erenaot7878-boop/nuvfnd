import React, { useState } from 'react';
import { X, Printer } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { OrderDetails } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: OrderDetails) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onOrderSuccess }) => {
  const { cart, cartTotal, clearCart } = useCart();
  
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [patientName, setPatientName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('CA');
  const [zip, setZip] = useState('');
  const [dob, setDob] = useState('1992-04-18');
  const [hasAllergies, setHasAllergies] = useState('None');
  const [attestation, setAttestation] = useState(false);
  const [paymentType, setPaymentType] = useState<'card' | 'hsa'>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExp, setCardExp] = useState('11/28');
  const [cardCvc, setCardCvc] = useState('739');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderDetails | null>(null);

  if (!isOpen) return null;

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !email || !street || !city || !zip) {
      alert('Please fill in required shipping fields');
      return;
    }
    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attestation) {
      alert('Please confirm the clinical physician review attestation.');
      return;
    }
    setStep(3);
  };

  const handleFinalCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const randomOrderNum = Math.floor(10000 + Math.random() * 90000);
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 2);

      const order: OrderDetails = {
        orderId: `NM-${randomOrderNum}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        items: [...cart],
        subtotal: cartTotal,
        shipping: 0,
        total: cartTotal,
        patientName,
        email,
        phone: phone || '(555) 019-2834',
        shippingAddress: {
          street,
          city,
          state,
          zip,
        },
        deliveryEst: deliveryDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      };

      setConfirmedOrder(order);
      onOrderSuccess(order);
      clearCart();
      setIsSubmitting(false);
      setStep(4);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-6" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-[#000000]/40 transition-opacity"
        onClick={() => step !== 4 && onClose()}
      />

      <div className="relative bg-[#FFFFFF] max-w-2xl w-full border border-[#E6E6E6] z-10 flex flex-col my-8">
        
        {/* Header */}
        <div className="px-8 h-16 border-b border-[#E6E6E6] flex items-center justify-between">
          <span className="text-[14px] text-[#111111] font-medium">
            {step === 4 ? 'Order registered' : 'Clinical intake and checkout'}
          </span>
          {step !== 4 && (
            <button
              onClick={onClose}
              className="text-[#111111] hover:text-[#666666] cursor-pointer"
              aria-label="Close"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* Step indicator: sentence case 14px */}
        {step < 4 && (
          <div className="bg-[#F5F5F5] border-b border-[#E6E6E6] px-8 py-3 text-[14px] text-[#666666] flex items-center justify-between">
            <span className={step >= 1 ? 'text-[#111111]' : ''}>Step 1. Patient</span>
            <span>/</span>
            <span className={step >= 2 ? 'text-[#111111]' : ''}>Step 2. Clinical review</span>
            <span>/</span>
            <span className={step >= 3 ? 'text-[#111111]' : ''}>Step 3. Payment</span>
          </div>
        )}

        {/* Form Body */}
        <div className="p-8">
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-xl font-medium tracking-tight text-[#111111] font-['Jost']">
                  Patient and shipping details
                </h3>
                <p className="text-[14px] text-[#666666]">
                  Prescription products require clinician intake review. Required for state compounding registry and parcel tracking.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[14px] text-[#111111] block font-normal">Full legal name</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Eleanor Vance"
                    className="w-full h-12 px-4 border border-[#DDDDDD] rounded-none text-[14px] text-[#111111] placeholder-[#999999] focus:border-[#111111] outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[14px] text-[#111111] block font-normal">Date of birth</label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full h-12 px-4 border border-[#DDDDDD] rounded-none text-[14px] text-[#111111] placeholder-[#999999] focus:border-[#111111] outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[14px] text-[#111111] block font-normal">Email address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="eleanor@example.com"
                    className="w-full h-12 px-4 border border-[#DDDDDD] rounded-none text-[14px] text-[#111111] placeholder-[#999999] focus:border-[#111111] outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[14px] text-[#111111] block font-normal">Phone number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 234-5678"
                    className="w-full h-12 px-4 border border-[#DDDDDD] rounded-none text-[14px] text-[#111111] placeholder-[#999999] focus:border-[#111111] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[14px] text-[#111111] block font-normal">Street address</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="740 Park Avenue, Apt 4B"
                  className="w-full h-12 px-4 border border-[#DDDDDD] rounded-none text-[14px] text-[#111111] placeholder-[#999999] focus:border-[#111111] outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[14px] text-[#111111] block font-normal">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="New York"
                    className="w-full h-12 px-4 border border-[#DDDDDD] rounded-none text-[14px] text-[#111111] placeholder-[#999999] focus:border-[#111111] outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[14px] text-[#111111] block font-normal">State</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full h-12 px-4 border border-[#DDDDDD] rounded-none text-[14px] text-[#111111] focus:border-[#111111] outline-none bg-white"
                  >
                    {['CA', 'NY', 'FL', 'TX', 'IL', 'WA', 'CO', 'AZ', 'NV', 'GA', 'NC', 'PA', 'OH'].map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[14px] text-[#111111] block font-normal">Postal code</label>
                  <input
                    type="text"
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="10021"
                    className="w-full h-12 px-4 border border-[#DDDDDD] rounded-none text-[14px] text-[#111111] placeholder-[#999999] focus:border-[#111111] outline-none"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-[#E6E6E6] flex items-center justify-between">
                <span className="text-[14px] text-[#666666]">
                  Subtotal: <strong className="font-['Barlow_Condensed'] text-[17px] text-[#111111]">${cartTotal.toFixed(2)}</strong>
                </span>
                <button
                  type="submit"
                  className="px-8 h-12 bg-[#111111] hover:bg-[#222222] text-white text-[11px] uppercase tracking-[0.14em] font-medium transition-colors cursor-pointer"
                >
                  CONTINUE TO CLINICAL REVIEW
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-xl font-medium tracking-tight text-[#111111] font-['Jost']">
                  Physician review attestation
                </h3>
                <p className="text-[14px] text-[#666666]">
                  A licensed clinician evaluates each intake before compounding release.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[14px] text-[#111111] block font-normal">Allergies or health notes</label>
                <input
                  type="text"
                  value={hasAllergies}
                  onChange={(e) => setHasAllergies(e.target.value)}
                  className="w-full h-12 px-4 border border-[#DDDDDD] rounded-none text-[14px] text-[#111111] placeholder-[#999999] focus:border-[#111111] outline-none"
                />
              </div>

              <div className="border border-[#E6E6E6] p-4">
                <label className="flex items-start gap-3 cursor-pointer text-[14px] text-[#666666]">
                  <input
                    type="checkbox"
                    required
                    checked={attestation}
                    onChange={(e) => setAttestation(e.target.checked)}
                    className="mt-1 accent-[#111111]"
                  />
                  <span>
                    I confirm I am 18 years or older, provide accurate health information, and consent to physician evaluation and compounding pharmacy dispensing.
                  </span>
                </label>
              </div>

              <div className="pt-6 border-t border-[#E6E6E6] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[14px] text-[#666666] hover:text-[#111111]"
                >
                  Back to details
                </button>
                <button
                  type="submit"
                  className="px-8 h-12 bg-[#111111] hover:bg-[#222222] text-white text-[11px] uppercase tracking-[0.14em] font-medium transition-colors cursor-pointer"
                >
                  PROCEED TO PAYMENT
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleFinalCheckout} className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-xl font-medium tracking-tight text-[#111111] font-['Jost']">
                  Payment
                </h3>
                <p className="text-[14px] text-[#666666]">
                  Credit cards, HSA and FSA payment cards accepted.
                </p>
              </div>

              <div className="flex border border-[#E6E6E6]">
                <button
                  type="button"
                  onClick={() => setPaymentType('card')}
                  className={`flex-1 h-12 text-[11px] uppercase tracking-[0.14em] font-medium cursor-pointer ${
                    paymentType === 'card' ? 'bg-[#111111] text-white' : 'text-[#666666] hover:text-[#111111]'
                  }`}
                >
                  Credit card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType('hsa')}
                  className={`flex-1 h-12 text-[11px] uppercase tracking-[0.14em] font-medium cursor-pointer border-l border-[#E6E6E6] ${
                    paymentType === 'hsa' ? 'bg-[#111111] text-white' : 'text-[#666666] hover:text-[#111111]'
                  }`}
                >
                  HSA / FSA card
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[14px] text-[#111111] block font-normal">Card number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full h-12 px-4 border border-[#DDDDDD] font-mono text-[14px] text-[#111111] focus:border-[#111111] outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[14px] text-[#111111] block font-normal">Expiration</label>
                    <input
                      type="text"
                      value={cardExp}
                      onChange={(e) => setCardExp(e.target.value)}
                      className="w-full h-12 px-4 border border-[#DDDDDD] font-mono text-[14px] text-[#111111] focus:border-[#111111] outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[14px] text-[#111111] block font-normal">Security code</label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full h-12 px-4 border border-[#DDDDDD] font-mono text-[14px] text-[#111111] focus:border-[#111111] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#F5F5F5] p-4 text-[14px] space-y-2 text-[#666666]">
                <div className="flex justify-between">
                  <span>Prescription subtotal</span>
                  <span className="font-['Barlow_Condensed'] text-[#111111] font-semibold">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="text-[#111111]">Included</span>
                </div>
                <div className="flex justify-between">
                  <span>Clinical review</span>
                  <span className="text-[#111111]">Included</span>
                </div>
                <div className="border-t border-[#E6E6E6] pt-2 flex justify-between font-normal text-[#111111]">
                  <span>Total due</span>
                  <span className="font-['Barlow_Condensed'] text-[20px] font-semibold">${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-[#E6E6E6] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-[14px] text-[#666666] hover:text-[#111111]"
                >
                  Back to review
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 h-12 bg-[#111111] hover:bg-[#222222] text-white text-[11px] uppercase tracking-[0.14em] font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'AUTHORIZING…' : `AUTHORIZE $${cartTotal.toFixed(2)}`}
                </button>
              </div>
            </form>
          )}

          {step === 4 && confirmedOrder && (
            <div className="space-y-6 text-center py-4">
              <div className="space-y-1">
                <h3 className="text-2xl font-medium tracking-tight text-[#111111] font-['Jost']">
                  Order reference {confirmedOrder.orderId}
                </h3>
                <p className="text-[14px] text-[#666666]">
                  Confirmed for patient {confirmedOrder.patientName}. Arrival estimated for {confirmedOrder.deliveryEst}.
                </p>
              </div>

              <div className="bg-[#F5F5F5] p-6 text-left text-[14px] space-y-3">
                <div className="border-b border-[#E6E6E6] pb-3 flex justify-between text-[#666666]">
                  <span>Shipping address</span>
                  <span className="text-[#111111]">
                    {confirmedOrder.shippingAddress.street}, {confirmedOrder.shippingAddress.city}, {confirmedOrder.shippingAddress.state} {confirmedOrder.shippingAddress.zip}
                  </span>
                </div>
                <div className="space-y-1 text-[#666666]">
                  {confirmedOrder.items.map((it) => (
                    <div key={it.variantId} className="flex justify-between">
                      <span>{it.productTitle} ({it.variantTitle}) × {it.qty}</span>
                      <span className="font-['Barlow_Condensed'] text-[#111111] font-semibold">${(Number(it.price) * it.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#E6E6E6] pt-3 flex justify-between font-normal text-[#111111]">
                  <span>Total authorized</span>
                  <span className="font-['Barlow_Condensed'] text-[20px] font-semibold">${confirmedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-6 h-12 border border-[#111111] text-[#111111] hover:bg-[#F5F5F5] text-[11px] uppercase tracking-[0.14em] font-medium transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Printer size={16} strokeWidth={1.5} />
                  <span>PRINT RECEIPT</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 h-12 bg-[#111111] text-white hover:bg-[#222222] text-[11px] uppercase tracking-[0.14em] font-medium transition-colors cursor-pointer"
                >
                  RETURN TO STORE
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
