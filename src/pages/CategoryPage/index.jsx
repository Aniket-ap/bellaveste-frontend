import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { productApi } from '../../services/api/productApi';
import { categoryApi } from '../../services/api/categoryApi';
import { ProductCard } from '../../components/ui/ProductCard';

export const CategoryPage = () => {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [sort, setSort] = useState('-price');

  useEffect(() => {
    let cancelled = false;
    const fetchCategory = async () => {
      setLoading(true);
      setError(null);
      try {
        const categoryResponse = await categoryApi.getAll();
        const categories = categoryResponse.data?.data || categoryResponse.data || [];

        const foundCategory = categories.find((c) => c.slug === slug || c._id === slug);
        if (cancelled) return;

        if (!foundCategory) {
          if (slug?.match(/^[0-9a-fA-F]{24}$/)) {
            setCategory({ name: 'Category', _id: slug, slug });
            setCategoryId(slug);
            return;
          }
          throw new Error('Category not found');
        }

        setCategory(foundCategory);
        setCategoryId(foundCategory._id);
      } catch (err) {
        if (cancelled) return;
        setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (slug) fetchCategory();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    const fetchProducts = async () => {
      if (!categoryId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await productApi.getAll({ category: categoryId, sort, limit: 100 });
        const items = response?.data?.products || response?.products || [];
        if (cancelled) return;
        setProducts(Array.isArray(items) ? items : []);
      } catch (err) {
        if (cancelled) return;
        setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [categoryId, sort]);

  const filteredProducts = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const name = (p?.name || '').toString().toLowerCase();
      const desc = (p?.description || '').toString().toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }, [products, searchValue]);

  return (
    <div className="min-h-screen bg-[color:var(--bv-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">
          Home / Category
        </div>

        <div className="mt-2 flex items-end justify-between gap-6 flex-wrap">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[color:var(--bv-text)]">
            {(category?.name || 'CATEGORY').toUpperCase()}
          </h1>
          <Link
            to="/shop"
            className="text-xs tracking-[0.18em] uppercase text-[color:var(--bv-muted)] hover:text-[color:var(--bv-text)] transition-colors"
          >
            Back to Shop
          </Link>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--bv-muted)]">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
                  </svg>
                </div>
                <input
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search in this category"
                  className="h-12 w-full rounded-[1.25rem] bg-[color:var(--bv-surface)]/70 border border-[color:var(--bv-border)] pl-12 pr-12 text-sm text-[color:var(--bv-text)] outline-none focus:border-[color:var(--bv-border-strong)]"
                />
                {searchValue ? (
                  <button
                    type="button"
                    onClick={() => setSearchValue('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/5 text-[color:var(--bv-muted)] hover:text-[color:var(--bv-text)] transition-colors flex items-center justify-center"
                  >
                    <span className="sr-only">Clear search</span>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                ) : null}
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-3 shrink-0">
              <div className="text-xs tracking-[0.18em] uppercase text-[color:var(--bv-muted)]">
                {filteredProducts.length} items
              </div>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="h-10 rounded-full bg-[color:var(--bv-surface)]/70 border border-[color:var(--bv-border)] pl-4 pr-10 text-[11px] tracking-[0.18em] uppercase text-[color:var(--bv-text)] outline-none focus:border-[color:var(--bv-border-strong)] appearance-none"
                >
                  <option value="-price">Price: High to Low</option>
                  <option value="price">Price: Low to High</option>
                  <option value="-createdAt">Newest First</option>
                  <option value="-ratingsAverage">Top Rated</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--bv-muted)]">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:hidden grid grid-cols-12 gap-3 items-center">
            <div className="col-span-5 text-[11px] tracking-[0.18em] uppercase text-[color:var(--bv-muted)]">
              {filteredProducts.length} items
            </div>
            <div className="col-span-7 relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-10 w-full rounded-full bg-[color:var(--bv-surface)]/70 border border-[color:var(--bv-border)] pl-4 pr-10 text-[11px] tracking-[0.18em] uppercase text-[color:var(--bv-text)] outline-none focus:border-[color:var(--bv-border-strong)] appearance-none"
              >
                <option value="-price">High to Low</option>
                <option value="price">Low to High</option>
                <option value="-createdAt">Newest</option>
                <option value="-ratingsAverage">Top Rated</option>
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--bv-muted)]">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="flex items-center gap-3">
                <div className="relative h-6 w-6">
                  <div className="absolute inset-0 rounded-full border-2 border-black/10" />
                  <div className="absolute inset-0 rounded-full border-2 border-[color:var(--bv-text)]/70 border-t-transparent animate-spin" />
                </div>
                <span className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Loading</span>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-[2rem] border border-[color:var(--bv-border)] bg-[color:var(--bv-surface)]/60 p-10 text-center">
              <h3 className="text-lg font-semibold text-[color:var(--bv-text)]">Failed to load category</h3>
              <div className="mt-2 text-sm text-[color:var(--bv-muted)]">
                We couldn&apos;t find or load this category.
              </div>
              <Link
                to="/shop"
                className="mt-5 inline-flex rounded-full bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)] px-5 py-2 text-xs tracking-[0.18em] uppercase hover:bg-black transition-colors"
              >
                Go to Shop
              </Link>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-[2rem] border border-[color:var(--bv-border)] bg-[color:var(--bv-surface)]/60 p-10 text-center">
              <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">No results</div>
              <div className="mt-2 text-sm text-[color:var(--bv-text)]">No products found in this category.</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
