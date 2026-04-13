import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../services/api/authApi';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authApi.forgotPassword(email);
      const message = response.message || 'If your email exists, a reset link will be sent.';
      setSuccess(message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request password reset');
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
              to="/login"
              className="inline-flex items-center gap-3 text-xs tracking-[0.18em] uppercase text-[color:var(--bv-muted)] hover:text-[color:var(--bv-text)] transition-colors"
            >
              <span className="h-10 w-10 rounded-full bg-black/5 flex items-center justify-center text-[color:var(--bv-text)]">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 18l-6-6 6-6" />
                </svg>
              </span>
              Back to Login
            </Link>

            <div className="mt-10">
              <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Recovery</div>
              <h1 className="mt-3 text-5xl sm:text-6xl font-bold tracking-tight text-[color:var(--bv-text)]">
                RESET<br />PASSWORD
              </h1>
              <div className="mt-4 text-sm text-[color:var(--bv-muted)] max-w-md">
                Enter your email address and we&apos;ll send you a link to reset your password.
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
                      id="email"
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
                </div>

                {error ? (
                  <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}
                
                {success ? (
                  <div className="rounded-[1.5rem] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {success}
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
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
