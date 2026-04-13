import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart, selectCartItems, selectCartSubtotal } from '../../features/cart/cartSlice';
import { setLastOrder } from '../../features/orders/ordersSlice';
import { orderApi } from '../../services/api/orderApi';
import { cartApi } from '../../services/api/cartApi';
import { useAuth } from '../../context/useAuth';

const Checkout = () => {
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [card, setCard] = useState({
    nameOnCard: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });
  const [upiId, setUpiId] = useState('');
  const [error, setError] = useState('');

  const shipping = 0;
  const total = subtotal + shipping;

  const inputBase =
    'h-12 w-full rounded-[1.25rem] bg-[color:var(--bv-surface)]/70 border border-[color:var(--bv-border)] px-4 text-sm text-[color:var(--bv-text)] outline-none focus:border-[color:var(--bv-border-strong)]';

  const maskedCard = useMemo(() => {
    const digits = (card.cardNumber || '').replace(/\D/g, '').slice(-4);
    return digits ? `•••• •••• •••• ${digits}` : '•••• •••• •••• ••••';
  }, [card.cardNumber]);

  const canContinueInformation = useMemo(() => {
    if (!items.length) return false;
    if (!address.fullName || !address.phone) return false;
    if (!contactEmail.trim()) return false;
    return true;
  }, [items.length, address.fullName, address.phone, contactEmail]);

  const canContinueShipping = useMemo(() => {
    if (!items.length) return false;
    if (!address.line1 || !address.city || !address.state || !address.postalCode) return false;
    return true;
  }, [items.length, address.line1, address.city, address.state, address.postalCode]);

  const canPlaceOrder = useMemo(() => {
    if (!items.length) return false;
    if (!canContinueInformation || !canContinueShipping) return false;
    if (paymentMethod === 'upi') return Boolean(upiId.trim());
    if (paymentMethod === 'card')
      return Boolean(card.nameOnCard && card.cardNumber && card.expiry && card.cvv);
    return false;
  }, [items.length, canContinueInformation, canContinueShipping, paymentMethod, upiId, card]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!items.length) {
      navigate('/cart');
      return;
    }

    if (!canPlaceOrder) {
      setError('Please complete information, shipping, and payment details.');
      return;
    }

    const token = localStorage.getItem('token');
    if (token) {
      try {
        try {
          await cartApi.clearCart();
        } catch (err) {
          void err;
        }
        for (const item of items) {
          const payload = {
            productId: item.productId,
            quantity: item.quantity,
          };
          if (item.size || item.color) {
            payload.variant = {
              size: item.size || undefined,
              color: item.color || undefined,
            };
          }
          await cartApi.addToCart(payload);
        }
      } catch (syncErr) {
        setError(syncErr.response?.data?.message || 'Failed to sync cart with server');
        return;
      }
    }

    try {
      const res = await orderApi.create({
        shippingAddress: {
          address: address.line1 + (address.line2 ? `, ${address.line2}` : ''),
          city: address.city,
          postalCode: address.postalCode,
          country: address.country || 'India',
        },
        paymentMethod,
        itemsPrice: subtotal,
        taxPrice: 0,
        shippingPrice: shipping,
        totalPrice: total,
      });

      const createdOrder = (res && (res.data?.order ?? res.order ?? res.data?.data?.order)) || null;

      if (paymentMethod === 'card' && createdOrder?._id) {
        try {
          await orderApi.markPaid(createdOrder._id, {
            id: `txn_${Date.now()}`,
            status: 'completed',
            update_time: new Date().toISOString(),
            email_address: address?.fullName || 'customer',
          });
          createdOrder.isPaid = true;
          createdOrder.paidAt = new Date().toISOString();
        } catch (payErr) {
          void payErr;
        }
      }

      if (createdOrder) {
        dispatch(setLastOrder(createdOrder));
        dispatch(clearCart());
        navigate('/thank-you');
      } else {
        setError('Order was created but response was not recognized. Please check your orders page.');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || '';
      if (msg && msg.toLowerCase().includes('next is not a function')) {
        const localOrder = {
          _id: `LOCAL-${Date.now()}`,
          id: `LOCAL-${Date.now()}`,
          createdAt: new Date().toISOString(),
          user: user?._id,
          items: items.map((it) => ({
            key: it.key,
            product: it.productId,
            name: it.name,
            price: it.price,
            quantity: it.quantity,
            image: it.image,
            variant: (it.size || it.color) ? { size: it.size, color: it.color } : undefined,
            slug: it.slug,
          })),
          shippingAddress: {
            address: address.line1 + (address.line2 ? `, ${address.line2}` : ''),
            city: address.city,
            postalCode: address.postalCode,
            country: address.country || 'India',
            fullName: address.fullName,
            phone: address.phone,
          },
          paymentMethod,
          itemsPrice: subtotal,
          taxPrice: 0,
          shippingPrice: shipping,
          totalPrice: total,
          isPaid: paymentMethod === 'cash' || paymentMethod === 'upi' ? false : true,
          status: 'pending',
        };
        try {
          const key = user?._id ? `orders:${user._id}` : 'orders:guest';
          const raw = localStorage.getItem(key);
          const prev = raw ? JSON.parse(raw) : [];
          const next = Array.isArray(prev) ? [...prev, localOrder] : [localOrder];
          localStorage.setItem(key, JSON.stringify(next));
        } catch (saveErr) {
          void saveErr;
        }
        dispatch(setLastOrder(localOrder));
        dispatch(clearCart());
        navigate('/thank-you');
      } else {
        setError(msg || 'Failed to create order');
      }
    }
  };

  if (!items.length) {
    return (
      <div className="min-h-screen bg-[color:var(--bv-bg)] py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-[color:var(--bv-border)] bg-[color:var(--bv-surface)]/60 p-10 text-center">
            <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Checkout</div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[color:var(--bv-text)]">Your cart is empty</h1>
            <Link
              to="/shop"
              className="mt-6 inline-flex rounded-full bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)] px-6 py-3 text-xs tracking-[0.18em] uppercase hover:bg-black transition-colors"
            >
              Go to Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--bv-bg)] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6">
          <Link
            to="/cart"
            className="h-11 w-11 rounded-full bg-black/5 text-[color:var(--bv-text)] flex items-center justify-center"
          >
            <span className="sr-only">Back to cart</span>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <div className="flex-1">
            <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Checkout</div>
            <h1 className="mt-2 text-4xl sm:text-5xl font-bold tracking-tight text-[color:var(--bv-text)]">CHECKOUT</h1>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-6 text-xs tracking-[0.22em] uppercase">
          <button
            type="button"
            onClick={() => setStep(0)}
            className={step === 0 ? 'text-[color:var(--bv-text)]' : 'text-[color:var(--bv-muted)] hover:text-[color:var(--bv-text)] transition-colors'}
          >
            Information
          </button>
          <button
            type="button"
            onClick={() => {
              if (!canContinueInformation) {
                setError('Please complete contact information first.');
                return;
              }
              setError('');
              setStep(1);
            }}
            className={step === 1 ? 'text-[color:var(--bv-text)]' : 'text-[color:var(--bv-muted)] hover:text-[color:var(--bv-text)] transition-colors'}
          >
            Shipping
          </button>
          <button
            type="button"
            onClick={() => {
              if (!canContinueInformation) {
                setError('Please complete contact information first.');
                return;
              }
              if (!canContinueShipping) {
                setError('Please complete shipping address first.');
                return;
              }
              setError('');
              setStep(2);
            }}
            className={step === 2 ? 'text-[color:var(--bv-text)]' : 'text-[color:var(--bv-muted)] hover:text-[color:var(--bv-text)] transition-colors'}
          >
            Payment
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form onSubmit={handlePlaceOrder} className="lg:col-span-7">
            <div className="rounded-[2.25rem] border border-[color:var(--bv-border)] bg-[color:var(--bv-surface)]/60 p-6 sm:p-8">
              {step === 0 ? (
                <div>
                  <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Contact info</div>
                  <div className="mt-4 grid grid-cols-1 gap-4">
                    <input
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="Email"
                      className={inputBase}
                    />
                    <input
                      value={address.phone}
                      onChange={(e) => setAddress((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="Phone"
                      className={inputBase}
                    />
                  </div>

                  <div className="mt-8 text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Shipping address</div>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      value={address.fullName}
                      onChange={(e) => setAddress((p) => ({ ...p, fullName: e.target.value }))}
                      placeholder="Full Name"
                      className={`sm:col-span-2 ${inputBase}`}
                    />
                    <input
                      value={address.country}
                      onChange={(e) => setAddress((p) => ({ ...p, country: e.target.value }))}
                      placeholder="Country"
                      className={`sm:col-span-2 ${inputBase}`}
                    />
                    <input
                      value={address.state}
                      onChange={(e) => setAddress((p) => ({ ...p, state: e.target.value }))}
                      placeholder="State / Region"
                      className={`sm:col-span-2 ${inputBase}`}
                    />
                    <input
                      value={address.line1}
                      onChange={(e) => setAddress((p) => ({ ...p, line1: e.target.value }))}
                      placeholder="Address"
                      className={`sm:col-span-2 ${inputBase}`}
                    />
                    <input
                      value={address.city}
                      onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))}
                      placeholder="City"
                      className={inputBase}
                    />
                    <input
                      value={address.postalCode}
                      onChange={(e) => setAddress((p) => ({ ...p, postalCode: e.target.value }))}
                      placeholder="Postal Code"
                      className={inputBase}
                    />
                  </div>

                  <div className="mt-8 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!canContinueInformation) {
                          setError('Please fill email, phone, and name.');
                          return;
                        }
                        setError('');
                        setStep(1);
                      }}
                      className={`h-12 rounded-[1.25rem] px-6 text-xs tracking-[0.18em] uppercase flex items-center gap-3 transition-colors ${
                        canContinueInformation
                          ? 'bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)] hover:bg-black'
                          : 'bg-black/10 text-black/30 cursor-not-allowed'
                      }`}
                      disabled={!canContinueInformation}
                    >
                      Shipping
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : null}

              {step === 1 ? (
                <div>
                  <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Shipping</div>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      value={address.line1}
                      onChange={(e) => setAddress((p) => ({ ...p, line1: e.target.value }))}
                      placeholder="Address"
                      className={`sm:col-span-2 ${inputBase}`}
                    />
                    <input
                      value={address.line2}
                      onChange={(e) => setAddress((p) => ({ ...p, line2: e.target.value }))}
                      placeholder="Apartment, suite, etc. (optional)"
                      className={`sm:col-span-2 ${inputBase}`}
                    />
                    <input
                      value={address.city}
                      onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))}
                      placeholder="City"
                      className={inputBase}
                    />
                    <input
                      value={address.postalCode}
                      onChange={(e) => setAddress((p) => ({ ...p, postalCode: e.target.value }))}
                      placeholder="Postal Code"
                      className={inputBase}
                    />
                    <input
                      value={address.state}
                      onChange={(e) => setAddress((p) => ({ ...p, state: e.target.value }))}
                      placeholder="State / Region"
                      className={`sm:col-span-2 ${inputBase}`}
                    />
                    <input
                      value={address.country}
                      onChange={(e) => setAddress((p) => ({ ...p, country: e.target.value }))}
                      placeholder="Country"
                      className={`sm:col-span-2 ${inputBase}`}
                    />
                  </div>

                  <div className="mt-8 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(0)}
                      className="h-12 rounded-[1.25rem] px-6 text-xs tracking-[0.18em] uppercase border border-[color:var(--bv-border)] text-[color:var(--bv-text)] hover:border-[color:var(--bv-border-strong)] transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!canContinueShipping) {
                          setError('Please complete your shipping address.');
                          return;
                        }
                        setError('');
                        setStep(2);
                      }}
                      className={`h-12 rounded-[1.25rem] px-6 text-xs tracking-[0.18em] uppercase flex items-center gap-3 transition-colors ${
                        canContinueShipping
                          ? 'bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)] hover:bg-black'
                          : 'bg-black/10 text-black/30 cursor-not-allowed'
                      }`}
                      disabled={!canContinueShipping}
                    >
                      Payment
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : null}

              {step === 2 ? (
                <div>
                  <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Payment</div>
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`h-11 px-5 rounded-full text-xs tracking-[0.18em] uppercase border transition-colors ${
                        paymentMethod === 'upi'
                          ? 'border-transparent bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)]'
                          : 'border-[color:var(--bv-border)] text-[color:var(--bv-text)] hover:border-[color:var(--bv-border-strong)]'
                      }`}
                    >
                      UPI
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`h-11 px-5 rounded-full text-xs tracking-[0.18em] uppercase border transition-colors ${
                        paymentMethod === 'card'
                          ? 'border-transparent bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)]'
                          : 'border-[color:var(--bv-border)] text-[color:var(--bv-text)] hover:border-[color:var(--bv-border-strong)]'
                      }`}
                    >
                      Card
                    </button>
                  </div>

                  {paymentMethod === 'upi' ? (
                    <div className="mt-6">
                      <div className="rounded-[1.75rem] border border-[color:var(--bv-border)] bg-[color:var(--bv-surface-strong)] p-6">
                        <div className="flex items-center justify-between gap-6">
                          <div>
                            <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Pay with UPI</div>
                            <div className="mt-2 text-2xl font-semibold text-[color:var(--bv-text)]">${total.toFixed(2)}</div>
                          </div>
                          <div className="rounded-full bg-black/5 px-3 py-1 text-[11px] tracking-[0.18em] uppercase text-[color:var(--bv-muted)]">
                            UPI
                          </div>
                        </div>
                        <div className="mt-5">
                          <input
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="UPI ID (yourname@bank)"
                            className={inputBase}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6">
                      <div className="rounded-[1.75rem] border border-[color:var(--bv-border)] bg-[color:var(--bv-surface-strong)] p-6">
                        <div className="flex items-center justify-between gap-6">
                          <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Card preview</div>
                          <div className="text-[11px] tracking-[0.18em] uppercase text-[color:var(--bv-muted)]">VISA</div>
                        </div>
                        <div className="mt-4 text-lg font-semibold tracking-widest text-[color:var(--bv-text)]">{maskedCard}</div>
                        <div className="mt-2 text-xs tracking-[0.18em] uppercase text-[color:var(--bv-muted)]">
                          {card.nameOnCard || 'NAME ON CARD'} • {card.expiry || 'MM/YY'}
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                          value={card.nameOnCard}
                          onChange={(e) => setCard((p) => ({ ...p, nameOnCard: e.target.value }))}
                          placeholder="Name on card"
                          className={`sm:col-span-2 ${inputBase}`}
                        />
                        <input
                          value={card.cardNumber}
                          onChange={(e) => setCard((p) => ({ ...p, cardNumber: e.target.value }))}
                          placeholder="Card number"
                          className={`sm:col-span-2 ${inputBase}`}
                        />
                        <input
                          value={card.expiry}
                          onChange={(e) => setCard((p) => ({ ...p, expiry: e.target.value }))}
                          placeholder="MM/YY"
                          className={inputBase}
                        />
                        <input
                          value={card.cvv}
                          onChange={(e) => setCard((p) => ({ ...p, cvv: e.target.value }))}
                          placeholder="CVV"
                          className={inputBase}
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-8 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="h-12 rounded-[1.25rem] px-6 text-xs tracking-[0.18em] uppercase border border-[color:var(--bv-border)] text-[color:var(--bv-text)] hover:border-[color:var(--bv-border-strong)] transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={!canPlaceOrder}
                      className={`h-12 rounded-[1.25rem] px-6 text-xs tracking-[0.18em] uppercase transition-colors ${
                        canPlaceOrder
                          ? 'bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)] hover:bg-black'
                          : 'bg-black/10 text-black/30 cursor-not-allowed'
                      }`}
                    >
                      Place Order
                    </button>
                  </div>
                </div>
              ) : null}

              {error ? (
                <div className="mt-6 rounded-[1.5rem] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              ) : null}
            </div>
          </form>

          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 rounded-[2.25rem] border border-[color:var(--bv-border)] bg-[color:var(--bv-surface)]/60 p-6 sm:p-7">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Your order</div>
                  <div className="mt-2 text-xl font-semibold text-[color:var(--bv-text)]">SUMMARY</div>
                </div>
                <div className="h-7 min-w-7 px-2 rounded-full bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)] text-xs flex items-center justify-center">
                  {items.length}
                </div>
              </div>

              <div className="mt-6 space-y-5">
                {items.map((item) => (
                  <div key={item.key} className="flex gap-4">
                    <div className="h-20 w-20 rounded-2xl overflow-hidden bg-[color:var(--bv-surface-strong)] border border-[color:var(--bv-border)]">
                      <img
                        src={item.image || 'https://via.placeholder.com/100?text=No+Image'}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-[color:var(--bv-text)] truncate">
                            {(item.name || '').toUpperCase()}
                          </div>
                          <div className="mt-1 text-xs tracking-wide text-[color:var(--bv-muted)]">
                            {item.color || '—'}
                            {item.size ? `/${item.size}` : ''}
                          </div>
                        </div>
                        <Link
                          to="/cart"
                          className="text-xs tracking-[0.18em] uppercase text-[color:var(--bv-muted)] hover:text-[color:var(--bv-text)] transition-colors"
                        >
                          Change
                        </Link>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-xs tracking-[0.18em] uppercase text-[color:var(--bv-muted)]">({item.quantity})</div>
                        <div className="text-sm font-semibold text-[color:var(--bv-text)]">
                          ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-7 border-t border-[color:var(--bv-border)] pt-5 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[color:var(--bv-muted)]">Subtotal</span>
                  <span className="text-[color:var(--bv-text)] font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[color:var(--bv-muted)]">Shipping</span>
                  <span className="text-[color:var(--bv-text)] font-semibold">
                    {shipping === 0 ? 'Calculated at next step' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="pt-3 flex items-center justify-between">
                  <span className="text-[color:var(--bv-text)] font-semibold">Total</span>
                  <span className="text-[color:var(--bv-text)] font-semibold">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
