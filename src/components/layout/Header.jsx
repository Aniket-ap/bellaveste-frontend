import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { useSelector } from 'react-redux';
import { selectCartCount } from '../../features/cart/cartSlice';
import logo from '../../assets/logo.png';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [theme, setTheme] = useState(() => {
    const current = document.documentElement.dataset.theme;
    return current === 'dark' ? 'dark' : 'light';
  });
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const cartCount = useSelector(selectCartCount);
  const searchInputRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem('bv_theme', next);
      } catch (e) {
        void e;
      }
      return next;
    });
  };

  useEffect(() => {
    if (!isSearchOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsSearchOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isSearchOpen) return;
    const id = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(id);
  }, [isSearchOpen]);

  const openSearch = () => {
    setIsSearchOpen(true);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    const q = searchValue.trim();
    navigate(q ? `/shop?search=${encodeURIComponent(q)}` : '/shop');
    setIsSearchOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Collections', path: '/shop' },
  ];

  return (
    <header className="sticky top-0 z-50">
      <div className="border-b border-[color:var(--bv-border)] bg-[color:var(--bv-bg)]/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={toggleMenu}
                className="h-10 w-10 rounded-full border border-[color:var(--bv-border)] bg-[color:var(--bv-surface)] flex items-center justify-center hover:border-[color:var(--bv-border-strong)]"
              >
                <span className="sr-only">{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
                {isMenuOpen ? (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7h16M4 12h16M4 17h16" />
                  </svg>
                )}
              </button>

              <nav className="hidden md:flex items-center gap-6 text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    className={({ isActive }) =>
                      `transition-colors ${isActive ? 'text-[color:var(--bv-text)]' : 'hover:text-[color:var(--bv-text)]'}`
                    }
                  >
                    {link.name}
                  </NavLink>
                ))}
              </nav>
            </div>

            <Link to="/" className="flex items-center text-[color:var(--bv-text)]">
              <img src={logo} alt="Bellaveste" className="h-8 w-auto object-contain" />
            </Link>

            <div className="flex items-center gap-2">
              <Link
                to="/cart"
                className="h-10 w-10 rounded-full border border-[color:var(--bv-border)] bg-[color:var(--bv-surface)] flex items-center justify-center hover:border-[color:var(--bv-border-strong)] relative"
              >
                <span className="sr-only">Cart</span>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[color:var(--bv-pill-bg)] text-[10px] font-bold text-[color:var(--bv-pill-text)]">
                    {cartCount}
                  </span>
                )}
              </Link>

              <button
                type="button"
                onClick={openSearch}
                className="h-10 w-10 rounded-full border border-[color:var(--bv-border)] bg-[color:var(--bv-surface)] flex items-center justify-center hover:border-[color:var(--bv-border-strong)]"
              >
                <span className="sr-only">Search</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                className="h-10 w-10 rounded-full border border-[color:var(--bv-border)] bg-[color:var(--bv-surface)] flex items-center justify-center hover:border-[color:var(--bv-border-strong)]"
              >
                <span className="sr-only">Toggle theme</span>
                {theme === 'dark' ? (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364-1.414-1.414M7.05 7.05 5.636 5.636m12.728 0-1.414 1.414M7.05 16.95l-1.414 1.414M12 8a4 4 0 100 8 4 4 0 000-8z"
                    />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
                    />
                  </svg>
                )}
              </button>

              <Link
                to={isAuthenticated ? '/profile' : '/login'}
                className="h-10 w-10 rounded-full border border-[color:var(--bv-border)] bg-[color:var(--bv-surface)] flex items-center justify-center hover:border-[color:var(--bv-border-strong)]"
              >
                <span className="sr-only">{isAuthenticated ? user?.name || 'Profile' : 'Login'}</span>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20 21a8 8 0 10-16 0M12 13a4 4 0 100-8 4 4 0 000 8z"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className={`fixed inset-0 z-[70] ${isMenuOpen ? '' : 'pointer-events-none'}`}>
        <button
          type="button"
          onClick={() => setIsMenuOpen(false)}
          className={`absolute inset-0 bg-black/35 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'
            }`}
        />
        <div
          className={`absolute top-0 right-0 h-full w-[min(420px,calc(100vw-2rem))] bg-[color:var(--bv-bg)] border-l border-[color:var(--bv-border)] shadow-[var(--bv-shadow)] transition-transform duration-300 ease-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
          <div className="h-16 px-5 flex items-center justify-between border-b border-[color:var(--bv-border)]">
            <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Menu</div>
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              className="h-10 w-10 rounded-full border border-[color:var(--bv-border)] bg-[color:var(--bv-surface)] flex items-center justify-center hover:border-[color:var(--bv-border-strong)]"
            >
              <span className="sr-only">Close menu</span>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 gap-3">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-2xl border px-4 py-3 text-sm tracking-[0.18em] uppercase ${isActive
                      ? 'border-[color:var(--bv-border-strong)] bg-[color:var(--bv-surface)] text-[color:var(--bv-text)]'
                      : 'border-[color:var(--bv-border)] bg-transparent text-[color:var(--bv-muted)] hover:text-[color:var(--bv-text)]'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}

              <Link
                to="/cart"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-2xl border border-[color:var(--bv-border)] px-4 py-3 text-sm tracking-[0.18em] uppercase text-[color:var(--bv-muted)] hover:text-[color:var(--bv-text)]"
              >
                Cart ({cartCount || 0})
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-2xl border border-[color:var(--bv-border)] px-4 py-3 text-sm tracking-[0.18em] uppercase text-[color:var(--bv-muted)] hover:text-[color:var(--bv-text)]"
                  >
                    {user?.name || 'Profile'}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="rounded-2xl border border-[color:var(--bv-border)] px-4 py-3 text-sm tracking-[0.18em] uppercase text-[color:var(--bv-muted)] hover:text-[color:var(--bv-text)] text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-2xl border border-[color:var(--bv-border)] px-4 py-3 text-sm tracking-[0.18em] uppercase text-[color:var(--bv-muted)] hover:text-[color:var(--bv-text)] text-center"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-2xl bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)] px-4 py-3 text-sm tracking-[0.18em] uppercase text-center"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isSearchOpen ? (
        <div className="fixed inset-0 z-[60]">
          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            className="absolute inset-0 bg-black/35"
          />
          <div className="absolute top-4 left-4 right-4 sm:top-8 sm:left-8 sm:right-8">
            <div className="max-w-3xl mx-auto rounded-3xl border border-[color:var(--bv-border)] bg-[color:var(--bv-bg)] shadow-[var(--bv-shadow)]">
              <form onSubmit={submitSearch} className="p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[color:var(--bv-muted)]">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        ref={searchInputRef}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        placeholder="Search products"
                        className="block w-full rounded-2xl border border-[color:var(--bv-border)] bg-[color:var(--bv-surface-strong)] pl-12 pr-4 py-3 text-sm text-[color:var(--bv-text)] placeholder:text-[color:var(--bv-muted)]"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-2xl bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)] px-5 py-3 text-xs tracking-[0.18em] uppercase"
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="hidden sm:inline-flex items-center justify-center rounded-2xl border border-[color:var(--bv-border)] px-5 py-3 text-xs tracking-[0.18em] uppercase text-[color:var(--bv-muted)] hover:text-[color:var(--bv-text)]"
                  >
                    Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
};
