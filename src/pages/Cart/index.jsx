import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  decrement,
  increment,
  removeItem,
  selectCartCount,
  selectCartItems,
  selectCartSubtotal,
  setQuantity,
} from '../../features/cart/cartSlice';

const Cart = () => {
  const items = useSelector(selectCartItems);
  const itemCount = useSelector(selectCartCount);
  const subtotal = useSelector(selectCartSubtotal);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const shipping = subtotal > 0 ? 0 : 0;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-[color:var(--bv-bg)] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6">
          <Link
            to="/shop"
            className="h-11 w-11 rounded-full bg-black/5 text-[color:var(--bv-text)] flex items-center justify-center"
          >
            <span className="sr-only">Back to shop</span>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <div className="flex-1">
            <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Bag</div>
            <h1 className="mt-2 text-4xl sm:text-5xl font-bold tracking-tight text-[color:var(--bv-text)]">CART</h1>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <div className="h-8 min-w-8 px-2 rounded-full bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)] text-xs flex items-center justify-center">
              {itemCount}
            </div>
            <Link
              to="/shop"
              className="text-xs tracking-[0.18em] uppercase text-[color:var(--bv-muted)] hover:text-[color:var(--bv-text)] transition-colors"
            >
              Continue
            </Link>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="mt-10 rounded-[2rem] border border-[color:var(--bv-border)] bg-[color:var(--bv-surface)]/60 p-10 text-center">
            <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Your bag</div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[color:var(--bv-text)]">Your cart is empty</h2>
            <div className="mt-2 text-sm text-[color:var(--bv-text)]">Add some products to get started.</div>
            <Link
              to="/shop"
              className="mt-6 inline-flex rounded-full bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)] px-6 py-3 text-xs tracking-[0.18em] uppercase hover:bg-black transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <div className="rounded-[2.25rem] border border-[color:var(--bv-border)] bg-[color:var(--bv-surface)]/60 overflow-hidden">
                <div className="px-6 sm:px-8 py-5 border-b border-[color:var(--bv-border)] flex items-center justify-between gap-4">
                  <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">
                    Items ({itemCount})
                  </div>
                  <Link
                    to="/shop"
                    className="text-xs tracking-[0.18em] uppercase text-[color:var(--bv-muted)] hover:text-[color:var(--bv-text)] transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>

                <div className="divide-y divide-[color:var(--bv-border)]">
                  {items.map((item) => {
                    const hasVariant = Boolean(item.size || item.color);
                    const variantText = [
                      item.color ? `Color: ${item.color}` : null,
                      item.size ? `Size: ${item.size}` : null,
                    ]
                      .filter(Boolean)
                      .join(' • ');

                    return (
                      <div key={item.key} className="p-6 sm:p-8 flex gap-5">
                        <Link to={item.slug ? `/product/${item.slug}` : '/shop'} className="shrink-0">
                          <div className="h-24 w-24 rounded-2xl overflow-hidden bg-[color:var(--bv-surface-strong)] border border-[color:var(--bv-border)]">
                            <img
                              src={item.image || 'https://via.placeholder.com/160?text=No+Image'}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </Link>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <Link
                                to={item.slug ? `/product/${item.slug}` : '/shop'}
                                className="text-base font-semibold text-[color:var(--bv-text)] hover:opacity-80 transition-opacity"
                              >
                                {(item.name || '').toUpperCase()}
                              </Link>
                              {hasVariant ? (
                                <div className="mt-2">
                                  <div className="inline-flex items-center rounded-full px-3 py-1 text-[11px] tracking-[0.18em] uppercase border border-black/10 bg-black/5 text-[color:var(--bv-muted)]">
                                    {variantText}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                            <div className="text-sm font-semibold text-[color:var(--bv-text)]">
                              ${(item.price || 0).toFixed(2)}
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
                            <div className="inline-flex items-center rounded-[1.25rem] border border-[color:var(--bv-border)] bg-[color:var(--bv-surface-strong)] overflow-hidden">
                              <button
                                type="button"
                                onClick={() => dispatch(decrement(item.key))}
                                className="h-11 w-11 flex items-center justify-center text-[color:var(--bv-text)] hover:bg-black/5 transition-colors"
                              >
                                <span className="sr-only">Decrease</span>
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14" />
                                </svg>
                              </button>
                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) =>
                                  dispatch(
                                    setQuantity({
                                      key: item.key,
                                      quantity: Math.max(1, Number(e.target.value || 1)),
                                    })
                                  )
                                }
                                className="h-11 w-16 bg-transparent text-center text-sm text-[color:var(--bv-text)] outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => dispatch(increment(item.key))}
                                className="h-11 w-11 flex items-center justify-center text-[color:var(--bv-text)] hover:bg-black/5 transition-colors"
                              >
                                <span className="sr-only">Increase</span>
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14M5 12h14" />
                                </svg>
                              </button>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-xs tracking-[0.18em] uppercase text-[color:var(--bv-muted)]">
                                ${(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)}
                              </div>
                              <button
                                type="button"
                                onClick={() => dispatch(removeItem(item.key))}
                                className="text-xs tracking-[0.18em] uppercase text-red-600 hover:text-red-500 transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-24 rounded-[2.25rem] border border-[color:var(--bv-border)] bg-[color:var(--bv-surface)]/60 p-6 sm:p-7">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Order</div>
                    <div className="mt-2 text-xl font-semibold text-[color:var(--bv-text)]">SUMMARY</div>
                  </div>
                  <div className="h-7 min-w-7 px-2 rounded-full bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)] text-xs flex items-center justify-center">
                    {itemCount}
                  </div>
                </div>

                <div className="mt-6 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[color:var(--bv-muted)]">Subtotal</span>
                    <span className="text-[color:var(--bv-text)] font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[color:var(--bv-muted)]">Shipping</span>
                    <span className="text-[color:var(--bv-text)] font-semibold">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="border-t border-[color:var(--bv-border)] pt-3 flex items-center justify-between">
                    <span className="text-[color:var(--bv-text)] font-semibold">Total</span>
                    <span className="text-[color:var(--bv-text)] font-semibold">${total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  className="mt-6 w-full h-12 rounded-[1.25rem] text-xs tracking-[0.18em] uppercase bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)] hover:bg-black transition-colors"
                >
                  Proceed to Checkout
                </button>

                <div className="mt-4 text-xs text-[color:var(--bv-muted)]">
                  This is a demo checkout. Payment details are not processed.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
