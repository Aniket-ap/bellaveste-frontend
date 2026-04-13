import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.passwordConfirm) {
        setError("Passwords don't match");
        return;
    }

    setLoading(true);
    
    try {
      const result = await register(formData);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Registration failed');
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
              <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Create your account</div>
              <h1 className="mt-3 text-5xl sm:text-6xl font-bold tracking-tight text-[color:var(--bv-text)]">
                SIGN UP
              </h1>
              <div className="mt-4 text-sm text-[color:var(--bv-muted)] max-w-md">
                Faster checkout, saved wishlist, and order history in one place.
              </div>

              <div className="mt-8 inline-flex items-center rounded-full border border-[color:var(--bv-border)] bg-[color:var(--bv-surface)]/50 p-1">
                <Link
                  to="/login"
                  className="h-10 px-5 rounded-full text-xs tracking-[0.18em] uppercase text-[color:var(--bv-muted)] hover:text-[color:var(--bv-text)] transition-colors flex items-center"
                >
                  Sign In
                </Link>
                <div className="h-10 px-5 rounded-full bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)] text-xs tracking-[0.18em] uppercase flex items-center">
                  Create Account
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-[2.25rem] border border-[color:var(--bv-border)] bg-[color:var(--bv-surface)]/60 p-6 sm:p-8">
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Full Name</div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="mt-2 h-12 w-full rounded-[1.25rem] bg-[color:var(--bv-surface)]/70 border border-[color:var(--bv-border)] px-4 text-sm text-[color:var(--bv-text)] outline-none focus:border-[color:var(--bv-border-strong)]"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

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
                      value={formData.email}
                      onChange={handleChange}
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
                      autoComplete="new-password"
                      required
                      className="mt-2 h-12 w-full rounded-[1.25rem] bg-[color:var(--bv-surface)]/70 border border-[color:var(--bv-border)] px-4 text-sm text-[color:var(--bv-text)] outline-none focus:border-[color:var(--bv-border-strong)]"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Confirm Password</div>
                      <button
                        type="button"
                        onClick={() => setShowConfirm((s) => !s)}
                        className="text-xs tracking-[0.18em] uppercase text-[color:var(--bv-muted)] hover:text-[color:var(--bv-text)] transition-colors"
                      >
                        {showConfirm ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <input
                      id="passwordConfirm"
                      name="passwordConfirm"
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      className="mt-2 h-12 w-full rounded-[1.25rem] bg-[color:var(--bv-surface)]/70 border border-[color:var(--bv-border)] px-4 text-sm text-[color:var(--bv-text)] outline-none focus:border-[color:var(--bv-border-strong)]"
                      placeholder="Repeat your password"
                      value={formData.passwordConfirm}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {error ? (
                  <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full h-12 rounded-[1.25rem] text-xs tracking-[0.18em] uppercase transition-colors ${
                    loading
                      ? 'bg-black/10 text-black/30 cursor-not-allowed'
                      : 'bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)] hover:bg-black'
                  }`}
                >
                  {loading ? 'Creating…' : 'Create account'}
                </button>

                <div className="pt-2 text-center text-xs tracking-[0.18em] uppercase text-[color:var(--bv-muted)]">
                  Already have an account?{' '}
                  <Link to="/login" className="text-[color:var(--bv-text)] hover:opacity-80 transition-opacity">
                    Sign in
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

export default Register;
