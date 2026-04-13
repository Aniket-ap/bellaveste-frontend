import React, { useEffect, useMemo, useState } from 'react';
import { productApi } from '../../../services/api/productApi';
import { ProductCard } from '../../../components/ui/ProductCard';
import { useFetchReducer } from '../../../hooks/useFetchReducer';
import { useNavigate } from 'react-router-dom';

export const ProductSection = ({ title, categoryId, categorySlug, variant = 'plain' }) => {
  const [state, dispatch] = useFetchReducer();
  const navigator = useNavigate();
  const [pageIndex, setPageIndex] = useState(0);
  const [perView, setPerView] = useState(() => {
    if (typeof window === 'undefined') return 4;
    if (window.matchMedia?.('(min-width: 1024px)')?.matches) return 4;
    if (window.matchMedia?.('(min-width: 768px)')?.matches) return 3;
    return 2;
  });
  const normalizedTitle = useMemo(() => (title || '').toUpperCase(), [title]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        dispatch({ type: 'start' });
        const response = categoryId 
          ? await productApi.getByCategory(categoryId)
          : await productApi.getAll();
          
        const products = response.products || response.data?.products || [];
        dispatch({ type: 'success', items: products.slice(0, 12) });
      } catch (error) {
        console.error(`Error loading products for ${title}:`, error);
        dispatch({ type: 'error', error });
      }
    };

    fetchProducts();
  }, [categoryId, title, dispatch]);

  useEffect(() => {
    const update = () => {
      const next = window.matchMedia?.('(min-width: 1024px)')?.matches
        ? 4
        : window.matchMedia?.('(min-width: 768px)')?.matches
          ? 3
          : 2;
      setPerView(next);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const onViewAll = () => {
    navigator(categoryId ? `/category/${categorySlug || categoryId}` : `/shop`);
  };

  const slides = useMemo(() => {
    const pageSize = Math.max(1, perView);
    const out = [];
    for (let i = 0; i < state.items.length; i += pageSize) out.push(state.items.slice(i, i + pageSize));
    return out.length ? out : [[]];
  }, [state.items, perView]);

  const slideCount = slides.length;
  const safeIndex = slideCount ? pageIndex % slideCount : 0;
  const isCarouselActive = slideCount > 1;

  const prev = () => {
    if (!isCarouselActive) return;
    setPageIndex((i) => (i - 1 + slideCount) % slideCount);
  };

  const next = () => {
    if (!isCarouselActive) return;
    setPageIndex((i) => (i + 1) % slideCount);
  };

  if (state.loading) return (
    <div className="flex justify-center items-center py-12">
      <div className="flex items-center gap-3">
        <div className="relative h-6 w-6">
          <div className="absolute inset-0 rounded-full border-2 border-black/10" />
          <div className="absolute inset-0 rounded-full border-2 border-[color:var(--bv-text)]/70 border-t-transparent animate-spin" />
        </div>
        <span className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Loading</span>
      </div>
    </div>
  );

  if (state.error) return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
       <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
         <p className="text-red-600">Failed to load products for {title}.</p>
       </div>
    </section>
  );

  if (!state.items.length) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[color:var(--bv-text)]">
            {normalizedTitle}
          </h2>
        </div>
        <div className="border border-[color:var(--bv-border)] rounded-3xl p-10 text-center text-[color:var(--bv-muted)] bg-[color:var(--bv-surface)]">
          No products found in this category.
        </div>
      </section>
    );
  }

  const wrapClass =
    variant === 'alt'
      ? 'rounded-[2.5rem] bg-[color:var(--bv-surface)]/55 px-4 sm:px-6 lg:px-8 py-10'
      : 'rounded-[2.5rem] bg-transparent px-0';

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className={wrapClass}>
        <div className="flex items-end justify-between gap-6 mb-6">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[color:var(--bv-text)] leading-[0.95]">
              {normalizedTitle}
            </h2>
            <div className="mt-1 text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">
              ({state.items.length})
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prev}
              disabled={!isCarouselActive}
              className={`inline-flex h-10 w-10 rounded-full items-center justify-center transition-colors ${
                isCarouselActive
                  ? 'bg-[color:var(--bv-surface-strong)] text-[color:var(--bv-muted)] hover:text-[color:var(--bv-text)]'
                  : 'bg-black/5 text-black/20 cursor-not-allowed'
              }`}
            >
              <span className="sr-only">Previous</span>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={next}
              disabled={!isCarouselActive}
              className={`inline-flex h-10 w-10 rounded-full items-center justify-center transition-colors ${
                isCarouselActive
                  ? 'bg-[color:var(--bv-surface-strong)] text-[color:var(--bv-muted)] hover:text-[color:var(--bv-text)]'
                  : 'bg-black/5 text-black/20 cursor-not-allowed'
              }`}
            >
              <span className="sr-only">Next</span>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 18l6-6-6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onViewAll}
              className="group rounded-full bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)] px-4 py-2 text-xs tracking-[0.18em] uppercase inline-flex items-center gap-2 hover:bg-black transition-colors"
            >
              View All
              <svg
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${safeIndex * 100}%)` }}
          >
            {slides.map((page, idx) => (
              <div key={idx} className="w-full shrink-0">
                <div className="flex flex-nowrap gap-4 sm:gap-6">
                  {page.map((product) => (
                    <div key={product._id} className="shrink-0 w-1/2 md:w-1/3 lg:w-1/4">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
