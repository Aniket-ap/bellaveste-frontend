import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--bv-bg)] py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6">
            <Link
              to="/"
              className="inline-flex items-center gap-3 text-xs tracking-[0.18em] uppercase text-[color:var(--bv-muted)] hover:text-[color:var(--bv-text)] transition-colors"
            >
              <span className="h-10 w-10 rounded-full bg-black/5 flex items-center justify-center text-[color:var(--bv-text)]">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 18l-6-6 6-6" />
                </svg>
              </span>
              Back
            </Link>

            <div className="mt-10">
              <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Welcome back</div>
              <h1 className="mt-3 text-5xl sm:text-6xl font-bold tracking-tight text-[color:var(--bv-text)]">
                SIGN IN
              </h1>
              <div className="mt-4 text-sm text-[color:var(--bv-muted)] max-w-md">
                Continue your checkout, track orders, and save favorites.
              </div>

              <div className="mt-8 inline-flex items-center rounded-full border border-[color:var(--bv-border)] bg-[color:var(--bv-surface)]/50 p-1">
                <div className="h-10 px-5 rounded-full bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)] text-xs tracking-[0.18em] uppercase flex items-center">
                  Sign In
                </div>
                <Link
                  to="/register"
                  className="h-10 px-5 rounded-full text-xs tracking-[0.18em] uppercase text-[color:var(--bv-muted)] hover:text-[color:var(--bv-text)] transition-colors flex items-center"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-[2.25rem] border border-[color:var(--bv-border)] bg-[color:var(--bv-surface)]/60 p-6 sm:p-8">
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Email</div>
                    <input
                      id="email-address"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="mt-2 h-12 w-full rounded-[1.25rem] bg-[color:var(--bv-surface)]/70 border border-[color:var(--bv-border)] px-4 text-sm text-[color:var(--bv-text)] outline-none focus:border-[color:var(--bv-border-strong)]"
                      placeholder="you@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Password</div>
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="text-xs tracking-[0.18em] uppercase text-[color:var(--bv-muted)] hover:text-[color:var(--bv-text)] transition-colors"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      className="mt-2 h-12 w-full rounded-[1.25rem] bg-[color:var(--bv-surface)]/70 border border-[color:var(--bv-border)] px-4 text-sm text-[color:var(--bv-text)] outline-none focus:border-[color:var(--bv-border-strong)]"
                      placeholder="Your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {error ? (
                  <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}

                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <label className="inline-flex items-center gap-3 text-xs tracking-[0.18em] uppercase text-[color:var(--bv-muted)]">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 rounded border-[color:var(--bv-border)]"
                    />
                    Remember me
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs tracking-[0.18em] uppercase text-[color:var(--bv-muted)] hover:text-[color:var(--bv-text)] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full h-12 rounded-[1.25rem] text-xs tracking-[0.18em] uppercase transition-colors ${
                    loading
                      ? 'bg-black/10 text-black/30 cursor-not-allowed'
                      : 'bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)] hover:bg-black'
                  }`}
                >
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>

                <div className="pt-2 text-center text-xs tracking-[0.18em] uppercase text-[color:var(--bv-muted)]">
                  New here?{' '}
                  <Link to="/register" className="text-[color:var(--bv-text)] hover:opacity-80 transition-opacity">
                    Create account
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
