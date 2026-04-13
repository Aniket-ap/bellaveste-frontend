import React, { useEffect } from 'react';
import { categoryApi } from '../../services/api/categoryApi';
import { useFetchReducer } from '../../hooks/useFetchReducer';
import { Hero } from "./components/Hero";
import { CategoryGrid } from './components/CategoryGrid';
import { ProductSection } from './components/ProductSection';


export const Home = () => {
  const [state, dispatch] = useFetchReducer();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        dispatch({ type: 'start' });
        const response = await categoryApi.getAll();
        dispatch({ type: 'success', items: response.data?.data || [] });
      } catch (error) {
        console.error('Error loading categories:', error);
        dispatch({ type: 'error', error });
      }
    };

    fetchCategories();
  }, [dispatch]);

  if (state.loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[color:var(--bv-bg)]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-full border-4 border-black/10" />
          <div className="absolute inset-0 rounded-full border-4 border-[color:var(--bv-text)]/70 border-t-transparent animate-spin" />
        </div>
        <p className="text-sm font-semibold text-[color:var(--bv-text)] tracking-[0.18em] uppercase">
          Loading Bellaveste
        </p>
        <p className="text-xs text-[color:var(--bv-muted)] tracking-wide">Getting the latest collections...</p>
      </div>
    </div>
  );

  if (state.error) return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[color:var(--bv-bg)] px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[color:var(--bv-text)] mb-2">Unable to Load Store</h2>
        <p className="text-[color:var(--bv-muted)] mb-6">We encountered an issue loading the categories.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="rounded-2xl bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)] px-6 py-3 text-xs tracking-[0.18em] uppercase"
        >
          Reload Page
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-20">
      <Hero />
      <CategoryGrid categories={state.items} />
      {state.items.map((category, idx) => (
        <ProductSection 
          key={category._id} 
          title={`Best of ${category.name}`} 
          categoryId={category._id} 
          categorySlug={category.slug || category._id}
          variant={idx % 2 === 0 ? 'plain' : 'alt'}
        />
      ))}
      <ProductSection title="New Arrivals" variant={state.items.length % 2 === 0 ? 'alt' : 'plain'} />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-[2.5rem] overflow-hidden bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)]">
          <div className="px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="text-xs tracking-[0.22em] uppercase text-white/80">BellaVeste Club</div>
              <h3 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight leading-[1.05]">
                Get first access to drops, restocks, and exclusive offers
              </h3>
              <p className="mt-4 text-sm text-white/80 max-w-xl">
                New arrivals every week. Early access for members. No spam, only style.
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-white/12 px-4 py-2 text-xs tracking-[0.18em] uppercase">Early Access</span>
                <span className="inline-flex items-center rounded-full bg-white/12 px-4 py-2 text-xs tracking-[0.18em] uppercase">Member Deals</span>
                <span className="inline-flex items-center rounded-full bg-white/12 px-4 py-2 text-xs tracking-[0.18em] uppercase">Style Picks</span>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-white/10 border border-white/15 p-4 sm:p-5">
                <div className="text-xs tracking-[0.22em] uppercase text-white/80">Join in 10 seconds</div>
                <div className="mt-3 flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="h-12 w-full rounded-2xl bg-white/95 text-black px-4 text-sm outline-none placeholder:text-black/50"
                  />
                  <button
                    type="button"
                    className="h-12 rounded-2xl bg-black text-white px-6 text-xs tracking-[0.18em] uppercase inline-flex items-center justify-center gap-2 hover:bg-black/90 transition-colors"
                  >
                    Subscribe
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </div>
                <div className="mt-3 text-xs text-white/70">
                  By subscribing you agree to receive updates from BellaVeste.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
