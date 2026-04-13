import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[color:var(--bv-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <Link to="/" className="inline-flex items-center gap-3 text-[color:var(--bv-text)]">
              <img src={logo} alt="" className="h-8 w-auto object-contain" />
              <span className="text-lg font-bold tracking-tight">Bellaveste</span>
            </Link>

            <div className="mt-6 text-4xl sm:text-5xl font-bold tracking-tight leading-[0.95] text-[color:var(--bv-text)]">
              WEAR LESS.
              <br />
              CHOOSE WELL.
            </div>
            <div className="mt-4 text-sm text-[color:var(--bv-muted)] max-w-md">
              Minimal silhouettes. Honest materials. A calmer way to build your wardrobe.
            </div>

            <div className="mt-8 flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="h-10 w-10 rounded-full border border-[color:var(--bv-border)] bg-[color:var(--bv-surface)] flex items-center justify-center text-[color:var(--bv-muted)] hover:text-[color:var(--bv-text)] hover:border-[color:var(--bv-border-strong)]"
              >
                <span className="sr-only">Instagram</span>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7h.01M7 7h10a4 4 0 014 4v6a4 4 0 01-4 4H7a4 4 0 01-4-4v-6a4 4 0 014-4z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 17a4 4 0 100-8 4 4 0 000 8z" />
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="h-10 w-10 rounded-full border border-[color:var(--bv-border)] bg-[color:var(--bv-surface)] flex items-center justify-center text-[color:var(--bv-muted)] hover:text-[color:var(--bv-text)] hover:border-[color:var(--bv-border-strong)]"
              >
                <span className="sr-only">Facebook</span>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 8h2V5h-2a4 4 0 00-4 4v3H8v3h2v6h3v-6h2l1-3h-3V9a1 1 0 011-1z"
                  />
                </svg>
              </a>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Shop</div>
                <ul className="mt-4 space-y-3 text-sm text-[color:var(--bv-text)]">
                  <li>
                    <Link to="/shop" className="hover:text-[color:var(--bv-muted)]">All Products</Link>
                  </li>
                  <li>
                    <Link to="/cart" className="hover:text-[color:var(--bv-muted)]">Cart</Link>
                  </li>
                  <li>
                    <Link to="/orders" className="hover:text-[color:var(--bv-muted)]">Orders</Link>
                  </li>
                </ul>
              </div>

              <div>
                <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Account</div>
                <ul className="mt-4 space-y-3 text-sm text-[color:var(--bv-text)]">
                  <li>
                    <Link to="/profile" className="hover:text-[color:var(--bv-muted)]">Profile</Link>
                  </li>
                  <li>
                    <Link to="/login" className="hover:text-[color:var(--bv-muted)]">Login</Link>
                  </li>
                  <li>
                    <Link to="/register" className="hover:text-[color:var(--bv-muted)]">Create Account</Link>
                  </li>
                </ul>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Newsletter</div>
                <div className="mt-4 text-sm text-[color:var(--bv-muted)]">
                  New drops, early access, and style notes.
                </div>
                <form
                  className="mt-4 flex items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                >
                  <input
                    type="email"
                    required
                    placeholder="Email address"
                    className="w-full rounded-2xl border border-[color:var(--bv-border)] bg-[color:var(--bv-surface-strong)] px-4 py-3 text-sm text-[color:var(--bv-text)] placeholder:text-[color:var(--bv-muted)]"
                  />
                  <button
                    type="submit"
                    className="shrink-0 rounded-2xl bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)] px-5 py-3 text-xs tracking-[0.18em] uppercase"
                  >
                    Join
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[color:var(--bv-border)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs tracking-[0.18em] uppercase text-[color:var(--bv-muted)]">
            © {currentYear} Bellaveste
          </div>
          <div className="text-xs tracking-[0.18em] uppercase text-[color:var(--bv-muted)]">
            Designed for a quieter wardrobe
          </div>
        </div>
      </div>
    </footer>
  );
};
