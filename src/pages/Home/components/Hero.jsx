import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productApi } from '../../../services/api/productApi';

export const Hero = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await productApi.getAll({ limit: 12 });
        const products = res?.data?.products || res?.products || [];
        const sorted = [...products].sort((a, b) => {
          const ta = a?.createdAt ? Date.parse(a.createdAt) : 0;
          const tb = b?.createdAt ? Date.parse(b.createdAt) : 0;
          return tb - ta;
        });

        const normalized = sorted
          .map((p) => {
            const imageCover = typeof p.imageCover === 'string' ? p.imageCover.replace(/`/g, '').trim() : '';
            return {
              id: p.id || p._id || p.slug || imageCover,
              name: p.name || 'Product',
              image: imageCover,
              slug: p.slug || '',
            };
          })
          .filter((p) => Boolean(p.image));

        if (cancelled) return;
        setItems(normalized);
        setSlideIndex(0);
      } catch {
        if (cancelled) return;
        setItems([]);
        setSlideIndex(0);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const slides = useMemo(() => {
    const out = [];
    for (let i = 0; i < items.length; i += 2) out.push(items.slice(i, i + 2));
    return out;
  }, [items]);

  const slideCount = slides.length;

  const prev = () => {
    if (slideCount <= 1) return;
    setSlideIndex((i) => (i - 1 + slideCount) % slideCount);
  };

  const next = () => {
    if (slideCount <= 1) return;
    setSlideIndex((i) => (i + 1) % slideCount);
  };

  return (
    <section className="border-b border-[color:var(--bv-border)] bg-[color:var(--bv-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-16 sm:pb-20 min-h-[78vh] flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-4">
            <div className="pt-2 sm:pt-6">
              <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">
                Summer
              </div>
              <h1 className="mt-3 text-5xl sm:text-6xl font-bold tracking-tight leading-[0.95] text-[color:var(--bv-text)]">
                NEW
                <br />
                COLLECTION
              </h1>
              <div className="mt-2 text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">
                2026
              </div>

              <div className="mt-8 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/shop')}
                  className="inline-flex items-center gap-3 rounded-2xl bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)] px-5 py-3 text-xs tracking-[0.18em] uppercase"
                >
                  Go To Shop
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-white/12">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 18l6-6-6-6" />
                    </svg>
                  </span>
                </button>
                <div className="flex items-center gap-2 text-[color:var(--bv-muted)]">
                  <button
                    type="button"
                    onClick={prev}
                    disabled={slideCount <= 1}
                    className="h-10 w-10 rounded-full border border-[color:var(--bv-border)] bg-[color:var(--bv-surface)] flex items-center justify-center hover:border-[color:var(--bv-border-strong)]"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    disabled={slideCount <= 1}
                    className="h-10 w-10 rounded-full border border-[color:var(--bv-border)] bg-[color:var(--bv-surface)] flex items-center justify-center hover:border-[color:var(--bv-border-strong)]"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${slideIndex * 100}%)` }}
              >
                {(slides.length ? slides : [[null, null]]).map((pair, idx) => (
                  <div key={idx} className="w-full shrink-0">
                    <div className="grid grid-cols-2 gap-4 sm:gap-6">
                      {(pair.length ? pair : [null, null]).map((p, j) => (
                        <button
                          key={p?.id || j}
                          type="button"
                          disabled={!p?.slug}
                          onClick={() => {
                            if (!p?.slug) return;
                            navigate(`/product/${p.slug}`);
                          }}
                          className={`relative rounded-[2rem] border bg-[color:var(--bv-surface-strong)] overflow-hidden aspect-[4/5] shadow-[var(--bv-shadow)] text-left transition-colors ${
                            p?.slug
                              ? 'border-[color:var(--bv-border)] hover:border-[color:var(--bv-border-strong)]'
                              : 'border-black/10 cursor-default'
                          }`}
                        >
                          {p?.image ? (
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-black/5" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
