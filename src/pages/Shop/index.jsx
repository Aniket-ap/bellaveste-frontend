import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productApi } from '../../services/api/productApi';
import { categoryApi } from '../../services/api/categoryApi';
import { ProductCard } from '../../components/ui/ProductCard';

export const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    sort: '-price',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAll();
        setCategories(response.data?.data || []);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          sort: filters.sort,
          limit: 100
        };

        if (filters.category) params.category = filters.category;
        if (filters.minPrice) params['price[gte]'] = filters.minPrice;
        if (filters.maxPrice) params['price[lte]'] = filters.maxPrice;

        const response = await productApi.getAll(params);
        setProducts(response.data?.products || []);
      } catch (error) {
        console.error('Error loading products:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  const searchQuery = (searchParams.get('search') || '').trim();
  const [searchValue, setSearchValue] = useState(searchQuery);

  useEffect(() => {
    setSearchValue(searchQuery);
  }, [searchQuery]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    const q = searchQuery.toLowerCase();
    return products.filter((p) => {
      const name = (p?.name || '').toString().toLowerCase();
      const desc = (p?.description || '').toString().toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }, [products, searchQuery]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      sort: '-price',
    });
  };

  const applySearch = (value) => {
    const nextValue = (value || '').trim();
    const next = new URLSearchParams(searchParams);
    if (nextValue) next.set('search', nextValue);
    else next.delete('search');
    setSearchParams(next);
  };

  const filtersContent = (
    <div className="rounded-[2rem] bg-[color:var(--bv-surface)]/60 border border-[color:var(--bv-border)] px-5 py-6">
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm font-semibold tracking-[0.18em] uppercase text-[color:var(--bv-text)]">
          Filters
        </div>
        <button
          type="button"
          onClick={() => {
            clearFilters();
            applySearch('');
          }}
          className="text-[10px] tracking-[0.22em] uppercase text-[color:var(--bv-muted)] hover:text-[color:var(--bv-text)] transition-colors"
        >
          Clear
        </button>
      </div>

      <div className="mt-5 space-y-4">
        <details open className="group">
          <summary className="list-none flex items-center justify-between gap-4 cursor-pointer select-none">
            <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-text)]">Category</div>
            <svg
              className="h-4 w-4 text-[color:var(--bv-muted)] transition-transform group-open:rotate-180"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleFilterChange('category', '')}
              className={`h-9 rounded-full px-4 text-[11px] tracking-[0.18em] uppercase border transition-colors ${
                filters.category === ''
                  ? 'bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)] border-transparent'
                  : 'bg-transparent text-[color:var(--bv-text)] border-[color:var(--bv-border)] hover:border-[color:var(--bv-border-strong)]'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                type="button"
                onClick={() => handleFilterChange('category', cat._id)}
                className={`h-9 rounded-full px-4 text-[11px] tracking-[0.18em] uppercase border transition-colors ${
                  filters.category === cat._id
                    ? 'bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)] border-transparent'
                    : 'bg-transparent text-[color:var(--bv-text)] border-[color:var(--bv-border)] hover:border-[color:var(--bv-border-strong)]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </details>

        <div className="h-px bg-[color:var(--bv-border)]/60" />

        <details open className="group">
          <summary className="list-none flex items-center justify-between gap-4 cursor-pointer select-none">
            <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-text)]">Price Range</div>
            <svg
              className="h-4 w-4 text-[color:var(--bv-muted)] transition-transform group-open:rotate-180"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              className="h-11 w-full rounded-2xl bg-[color:var(--bv-bg)] border border-[color:var(--bv-border)] px-4 text-sm text-[color:var(--bv-text)] outline-none focus:border-[color:var(--bv-border-strong)]"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              className="h-11 w-full rounded-2xl bg-[color:var(--bv-bg)] border border-[color:var(--bv-border)] px-4 text-sm text-[color:var(--bv-text)] outline-none focus:border-[color:var(--bv-border-strong)]"
            />
          </div>
        </details>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[color:var(--bv-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">
          Home / Products
        </div>
        <div className="mt-2 flex items-end justify-between gap-6 flex-wrap">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[color:var(--bv-text)]">
            PRODUCTS
          </h1>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24">{filtersContent}</div>
          </aside>

          <div className="lg:col-span-9">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    applySearch(searchValue);
                  }}
                  className="flex-1 min-w-0"
                >
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--bv-muted)]">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
                      </svg>
                    </div>
                    <input
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder="Search"
                      className="h-12 w-full rounded-[1.25rem] bg-[color:var(--bv-surface)]/70 border border-[color:var(--bv-border)] pl-12 pr-12 text-sm text-[color:var(--bv-text)] outline-none focus:border-[color:var(--bv-border-strong)]"
                    />
                    {searchValue ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchValue('');
                          applySearch('');
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/5 text-[color:var(--bv-muted)] hover:text-[color:var(--bv-text)] transition-colors flex items-center justify-center"
                      >
                        <span className="sr-only">Clear search</span>
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    ) : null}
                  </div>
                </form>

                <button
                  type="button"
                  onClick={() => setIsFiltersOpen(true)}
                  className="lg:hidden h-12 shrink-0 rounded-[1.25rem] border border-[color:var(--bv-border)] bg-[color:var(--bv-surface)]/70 px-5 text-xs tracking-[0.18em] uppercase text-[color:var(--bv-text)] hover:border-[color:var(--bv-border-strong)] transition-colors"
                >
                  Filters
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <button
                    type="button"
                    onClick={() => handleFilterChange('category', '')}
                    className={`h-10 shrink-0 rounded-full px-4 text-[11px] tracking-[0.18em] uppercase border transition-colors ${
                      filters.category === ''
                        ? 'bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)] border-transparent'
                        : 'bg-transparent text-[color:var(--bv-text)] border-[color:var(--bv-border)] hover:border-[color:var(--bv-border-strong)]'
                    }`}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      type="button"
                      onClick={() => handleFilterChange('category', cat._id)}
                      className={`h-10 shrink-0 rounded-full px-4 text-[11px] tracking-[0.18em] uppercase border transition-colors ${
                        filters.category === cat._id
                          ? 'bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)] border-transparent'
                          : 'bg-transparent text-[color:var(--bv-text)] border-[color:var(--bv-border)] hover:border-[color:var(--bv-border-strong)]'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
                <div className="hidden lg:flex items-center gap-3 shrink-0">
                  <div className="text-xs tracking-[0.18em] uppercase text-[color:var(--bv-muted)]">
                    {filteredProducts.length} items
                  </div>
                  <div className="relative">
                    <select
                      value={filters.sort}
                      onChange={(e) => handleFilterChange('sort', e.target.value)}
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
                    value={filters.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
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
                  <h3 className="text-lg font-semibold text-[color:var(--bv-text)]">Failed to load products</h3>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-4 rounded-full bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)] px-5 py-2 text-xs tracking-[0.18em] uppercase hover:bg-black transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="rounded-[2rem] border border-[color:var(--bv-border)] bg-[color:var(--bv-surface)]/60 p-10 text-center">
                  <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">No results</div>
                  <div className="mt-2 text-sm text-[color:var(--bv-text)]">No products match your filters.</div>
                  <button
                    type="button"
                    onClick={() => {
                      clearFilters();
                      applySearch('');
                    }}
                    className="mt-5 rounded-full bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)] px-5 py-2 text-xs tracking-[0.18em] uppercase hover:bg-black transition-colors"
                  >
                    Clear all
                  </button>
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
      </div>

      {isFiltersOpen ? (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/35"
            onClick={() => setIsFiltersOpen(false)}
          >
            <span className="sr-only">Close filters</span>
          </button>
          <div className="absolute inset-y-0 left-0 w-[88vw] max-w-sm bg-[color:var(--bv-bg)] p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Filters</div>
              <button
                type="button"
                onClick={() => setIsFiltersOpen(false)}
                className="h-10 w-10 rounded-full border border-[color:var(--bv-border)] bg-[color:var(--bv-surface)]/70 flex items-center justify-center text-[color:var(--bv-text)]"
              >
                <span className="sr-only">Close</span>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {filtersContent}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Shop;
