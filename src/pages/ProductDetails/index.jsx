import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { productApi } from '../../services/api/productApi';
import { useDispatch } from 'react-redux';
import { addItem } from '../../features/cart/cartSlice';
import { cartApi } from '../../services/api/cartApi';
import { wishlistApi } from '../../services/api/wishlistApi';
import { ProductCard } from '../../components/ui/ProductCard';

export const ProductDetails = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const [similarItems, setSimilarItems] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getCleanImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/600?text=No+Image';
    return url.replace(/`/g, '').trim();
  };

  const colorToHex = (value) => {
    if (!value) return null;
    const v = String(value).toLowerCase().trim();
    const map = {
      black: '#111827',
      white: '#ffffff',
      grey: '#9ca3af',
      gray: '#9ca3af',
      silver: '#d1d5db',
      red: '#ef4444',
      maroon: '#7f1d1d',
      green: '#22c55e',
      olive: '#4d7c0f',
      blue: '#3b82f6',
      navy: '#1e3a8a',
      sky: '#38bdf8',
      yellow: '#f59e0b',
      orange: '#fb923c',
      pink: '#ec4899',
      purple: '#a855f7',
      brown: '#92400e',
      beige: '#e7e5e4',
      cream: '#f5f5f4',
    };
    return map[v] || null;
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(slug);

        const extractProduct = (response) =>
          response?.data?.product ||
          response?.data?.data ||
          response?.data?.products?.[0] ||
          response?.product ||
          null;

        let response = null;
        if (isObjectId) {
          response = await productApi.getById(slug);
        } else {
          response = await productApi.getBySlug(slug);
        }

        let productData = extractProduct(response);

        if (!productData && !isObjectId) {
          try {
            const fallback = await productApi.getById(slug);
            productData = extractProduct(fallback);
          } catch {
            void 0;
          }
        }

        setProduct(productData);
        // Set initial selected image if available
        if (productData?.imageCover) {
          setSelectedImage(getCleanImageUrl(productData.imageCover));
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const images = useMemo(() => {
    const list = [
      product?.imageCover ? getCleanImageUrl(product.imageCover) : null,
      ...(Array.isArray(product?.images) ? product.images.map((u) => getCleanImageUrl(u)) : []),
    ].filter(Boolean);
    return [...new Set(list)];
  }, [product]);

  const thumbnailImages = useMemo(() => {
    const base = images.length ? images : [getCleanImageUrl(product?.imageCover)];
    const safeBase = base.filter(Boolean);
    if (!safeBase.length) return [];
    const target = Math.min(6, Math.max(4, safeBase.length));
    const out = [];
    for (let i = 0; i < target; i += 1) out.push(safeBase[i % safeBase.length]);
    return out;
  }, [images, product]);

  const categoryInfo = useMemo(() => {
    const raw = product?.category;
    if (!raw) return { id: '', slug: '', name: '' };
    if (typeof raw === 'string') return { id: raw, slug: '', name: '' };
    return { id: raw._id || '', slug: raw.slug || '', name: raw.name || '' };
  }, [product]);

  const uniqueSizes = useMemo(
    () => (product?.variants ? [...new Set(product.variants.map((v) => v.size).filter(Boolean))] : []),
    [product]
  );
  const uniqueColors = useMemo(
    () => (product?.variants ? [...new Set(product.variants.map((v) => v.color).filter(Boolean))] : []),
    [product]
  );

  const hasVariants = Boolean(product?.variants?.length);

  const getStockStatus = () => {
    if (!product?.variants?.length) {
      return {
        stock: product.totalStock,
        label: product.totalStock > 0 ? 'In Stock' : 'Out of Stock',
        isAvailable: product.totalStock > 0
      };
    }

    if (selectedSize && selectedColor) {
      const variant = product.variants.find(v => v.size === selectedSize && v.color === selectedColor);
      if (variant) {
        return {
          stock: variant.stock,
          label: variant.stock > 0 ? `In Stock (${variant.stock})` : 'Out of Stock',
          isAvailable: variant.stock > 0
        };
      }
      return { stock: 0, label: 'Unavailable', isAvailable: false };
    }

    return { stock: product.totalStock, label: 'Select Options', isAvailable: false };
  };

  const stockStatus = product ? getStockStatus() : { stock: 0, label: '', isAvailable: false };

  const isCtaDisabled = useMemo(() => {
    if (!product) return true;
    if (hasVariants && (!selectedSize || !selectedColor)) return true;
    if (hasVariants && selectedSize && selectedColor) {
      const variant = product.variants.find((v) => v.size === selectedSize && v.color === selectedColor);
      return !(variant && (variant.stock || 0) > 0);
    }
    return (product.totalStock || 0) <= 0;
  }, [product, hasVariants, selectedSize, selectedColor]);

  const handleAddToCart = (e) => {
    e.preventDefault();

    if (!product) return;

    if (hasVariants && (!selectedSize || !selectedColor)) return;

    const variant = hasVariants
      ? product.variants.find((v) => v.size === selectedSize && v.color === selectedColor)
      : null;

    const productId = product.id || product._id || product.slug;
    const price = typeof product.price === 'number' ? product.price : Number(product.price || 0);
    const stock = variant ? variant.stock : product.totalStock;

    const token = localStorage.getItem('token');
    if (token) {
      try {
        cartApi.addToCart({
          productId,
          quantity: 1,
          variant: hasVariants ? { size: selectedSize, color: selectedColor } : undefined,
        });
      } catch {
        // ignore API error for demo, proceed with local cart update
      }
    }

    dispatch(
      addItem({
        productId,
        name: product.name,
        price,
        image: getCleanImageUrl(product.imageCover || selectedImage),
        slug: product.slug,
        quantity: 1,
        size: hasVariants ? selectedSize : null,
        color: hasVariants ? selectedColor : null,
        stock: typeof stock === 'number' ? stock : null,
      })
    );

    navigate('/cart');
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!product || wishlistBusy) return;
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    setWishlistBusy(true);
    try {
      const productId = product.id || product._id || product.slug;
      await wishlistApi.add(productId);
    } catch (err) {
      void err;
    } finally {
      setWishlistBusy(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const fetchSimilar = async () => {
      if (!product) return;
      if (!categoryInfo.id) {
        setSimilarItems([]);
        return;
      }

      setSimilarLoading(true);
      try {
        const response = await productApi.getAll({
          category: categoryInfo.id,
          sort: '-ratingsAverage',
          limit: 24,
        });
        const items = response?.data?.products || response?.products || [];
        const currentId = product?._id || product?.id || '';
        const filtered = (Array.isArray(items) ? items : [])
          .filter((p) => (p?._id || p?.id) !== currentId)
          .slice(0, 8);
        if (!cancelled) setSimilarItems(filtered);
      } catch (err) {
        if (!cancelled) setSimilarItems([]);
        void err;
      } finally {
        if (!cancelled) setSimilarLoading(false);
      }
    };

    fetchSimilar();
    return () => {
      cancelled = true;
    };
  }, [product, categoryInfo.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[color:var(--bv-bg)]">
        <div className="flex items-center gap-3">
          <div className="relative h-7 w-7">
            <div className="absolute inset-0 rounded-full border-2 border-black/10" />
            <div className="absolute inset-0 rounded-full border-2 border-[color:var(--bv-text)]/70 border-t-transparent animate-spin" />
          </div>
          <span className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Loading</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[color:var(--bv-bg)] px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[color:var(--bv-text)] mb-2">Product Not Found</h2>
          <Link
            to="/shop"
            className="inline-flex rounded-full bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)] px-5 py-2 text-xs tracking-[0.18em] uppercase hover:bg-black transition-colors"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--bv-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-28 lg:pb-14">
        <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">
          Home / Shop / Product
        </div>

        <div className="mt-2 flex items-center justify-between gap-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="lg:hidden h-11 w-11 rounded-full bg-black/5 text-[color:var(--bv-text)] flex items-center justify-center"
          >
            <span className="sr-only">Back</span>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="lg:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={handleWishlist}
              disabled={wishlistBusy}
              className={`h-11 w-11 rounded-full flex items-center justify-center transition-colors ${wishlistBusy ? 'bg-black/5 text-black/20 cursor-not-allowed' : 'bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)] hover:bg-black'
                }`}
            >
              <span className="sr-only">Wishlist</span>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              <div className="lg:col-span-10">
                <div className="relative rounded-[2rem] overflow-hidden bg-[color:var(--bv-surface-strong)] shadow-[var(--bv-shadow)] lg:max-w-[560px]">
                  <div className="aspect-[4/5] lg:aspect-[1/1] w-full">
                    <img
                      src={selectedImage || images[0] || getCleanImageUrl(product.imageCover)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="hidden lg:flex absolute left-4 top-4 gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="h-11 w-11 rounded-full bg-white/80 backdrop-blur text-black flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <span className="sr-only">Back</span>
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                  </div>
                  <div className="hidden lg:flex absolute right-4 top-4 gap-2">
                    <button
                      type="button"
                      onClick={handleWishlist}
                      disabled={wishlistBusy}
                      className={`h-11 w-11 rounded-full flex items-center justify-center transition-colors ${wishlistBusy ? 'bg-white/70 text-black/30 cursor-not-allowed' : 'bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)] hover:bg-black'
                        }`}
                    >
                      <span className="sr-only">Wishlist</span>
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mt-4 lg:hidden">
                  <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {thumbnailImages.map((img, idx) => (
                      <button
                        key={`${img}-${idx}`}
                        type="button"
                        onClick={() => setSelectedImage(img)}
                        className={`shrink-0 w-16 rounded-2xl overflow-hidden border bg-[color:var(--bv-surface-strong)] transition-colors ${(selectedImage || images[0]) === img
                            ? 'border-[color:var(--bv-border-strong)]'
                            : 'border-[color:var(--bv-border)] hover:border-[color:var(--bv-border-strong)]'
                          }`}
                      >
                        <div className="aspect-[4/5] w-full">
                          <img src={img} alt="" className="h-full w-full object-cover" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="hidden lg:col-span-2 lg:flex lg:flex-col gap-3">
                {thumbnailImages.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`w-full rounded-2xl overflow-hidden border bg-[color:var(--bv-surface-strong)] transition-colors ${(selectedImage || images[0]) === img
                        ? 'border-[color:var(--bv-border-strong)]'
                        : 'border-[color:var(--bv-border)] hover:border-[color:var(--bv-border-strong)]'
                      }`}
                  >
                    <div className="aspect-[4/5] w-full">
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 rounded-[2.25rem] border border-[color:var(--bv-border)] bg-[color:var(--bv-surface)]/55 backdrop-blur p-6 sm:p-7">
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0">
                  <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">
                    {product?.category?.name ? product.category.name : 'Product'}
                  </div>
                  <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-[color:var(--bv-text)] leading-[1.05]">
                    {(product.name || 'Product').toUpperCase()}
                  </h1>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-semibold text-[color:var(--bv-text)]">
                    ${Number(product.price || 0).toFixed(0)}
                  </div>
                  <div className="mt-1 text-xs tracking-wide text-[color:var(--bv-muted)]">MRP incl. of all taxes</div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] tracking-[0.18em] uppercase border ${stockStatus.isAvailable ? 'border-black/10 bg-black/5 text-[color:var(--bv-text)]' : 'border-black/10 bg-black/5 text-[color:var(--bv-muted)]'
                      }`}
                  >
                    {stockStatus.label}
                  </div>
                  {stockStatus.isAvailable && stockStatus.stock < 10 ? (
                    <div className="text-[11px] tracking-[0.18em] uppercase text-[color:var(--bv-muted)] truncate">
                      Only {stockStatus.stock} left
                    </div>
                  ) : null}
                </div>
                {hasVariants && (selectedColor || selectedSize) ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedColor(null);
                      setSelectedSize(null);
                    }}
                    className="shrink-0 text-[10px] tracking-[0.22em] uppercase text-[color:var(--bv-muted)] hover:text-[color:var(--bv-text)] transition-colors"
                  >
                    Clear
                  </button>
                ) : null}
              </div>

              <div className="mt-5 text-sm text-[color:var(--bv-muted)] leading-relaxed">
                {product.description ? (
                  <div dangerouslySetInnerHTML={{ __html: product.description }} />
                ) : (
                  'No description available.'
                )}
              </div>

              <div className="mt-6 border-t border-[color:var(--bv-border)] pt-6">
                {hasVariants ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Select Options</div>
                      <div
                        className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] tracking-[0.18em] uppercase border ${
                          selectedColor && selectedSize
                            ? 'border-transparent bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)]'
                            : 'border-black/10 bg-black/5 text-[color:var(--bv-muted)]'
                        }`}
                      >
                        {selectedColor && selectedSize ? `Color: ${selectedColor} • Size: ${selectedSize}` : 'Select color & size'}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Color</div>
                        <div className="text-[10px] tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">
                          {selectedColor || 'Choose'}
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2.5">
                        {uniqueColors.map((color) => {
                          const hasAnyStockForColor = product.variants.some((v) => v.color === color && (v.stock || 0) > 0);
                          const isCompatibleWithSize =
                            !selectedSize || product.variants.some((v) => v.color === color && v.size === selectedSize && (v.stock || 0) > 0);
                          const hex = colorToHex(color);
                          const isSelected = selectedColor === color;

                          return (
                            <button
                              key={color}
                              type="button"
                              disabled={!hasAnyStockForColor}
                              onClick={() => {
                                setSelectedColor(color);
                                if (selectedSize && !isCompatibleWithSize) {
                                  const nextVariant = product.variants.find((v) => v.color === color && (v.stock || 0) > 0);
                                  setSelectedSize(nextVariant?.size || null);
                                }
                              }}
                              className={`h-11 w-11 rounded-2xl border flex items-center justify-center transition-colors ${
                                isSelected
                                  ? 'border-[color:var(--bv-border-strong)] bg-[color:var(--bv-surface-strong)]'
                                  : 'border-[color:var(--bv-border)] bg-[color:var(--bv-surface-strong)] hover:border-[color:var(--bv-border-strong)]'
                              } ${!hasAnyStockForColor ? 'opacity-35 cursor-not-allowed' : !isCompatibleWithSize ? 'opacity-70' : ''}`}
                            >
                              <span
                                className="h-7 w-7 rounded-xl"
                                style={{
                                  backgroundColor: hex || '#e5e7eb',
                                  border: hex && hex.toLowerCase() === '#ffffff' ? '1px solid rgba(0,0,0,0.12)' : undefined,
                                }}
                                title={color}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Size</div>
                        <div className="text-[10px] tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">
                          {selectedSize || 'Choose'}
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-5 sm:grid-cols-6 gap-2">
                        {uniqueSizes.map((size) => {
                          const hasAnyStockForSize = product.variants.some((v) => v.size === size && (v.stock || 0) > 0);
                          const isCompatibleWithColor =
                            !selectedColor || product.variants.some((v) => v.size === size && v.color === selectedColor && (v.stock || 0) > 0);
                          const isSelected = selectedSize === size;

                          return (
                            <button
                              key={size}
                              type="button"
                              disabled={!hasAnyStockForSize}
                              onClick={() => {
                                setSelectedSize(size);
                                if (selectedColor && !isCompatibleWithColor) {
                                  const nextVariant = product.variants.find((v) => v.size === size && (v.stock || 0) > 0);
                                  setSelectedColor(nextVariant?.color || null);
                                }
                              }}
                              className={`h-11 rounded-2xl border text-[11px] tracking-[0.18em] uppercase transition-colors ${
                                isSelected
                                  ? 'bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)] border-transparent'
                                  : 'bg-transparent text-[color:var(--bv-text)] border-[color:var(--bv-border)] hover:border-[color:var(--bv-border-strong)]'
                              } ${!hasAnyStockForSize ? 'opacity-35 cursor-not-allowed' : !isCompatibleWithColor ? 'opacity-70' : ''}`}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="mt-8 hidden lg:flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleWishlist}
                    disabled={wishlistBusy}
                    className={`h-12 w-12 rounded-2xl border flex items-center justify-center transition-colors ${wishlistBusy
                        ? 'border-black/10 bg-black/5 text-black/20 cursor-not-allowed'
                        : 'border-[color:var(--bv-border)] bg-[color:var(--bv-surface-strong)] text-[color:var(--bv-text)] hover:border-[color:var(--bv-border-strong)]'
                      }`}
                  >
                    <span className="sr-only">Wishlist</span>
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isCtaDisabled}
                    className={`flex-1 h-12 rounded-2xl text-xs tracking-[0.18em] uppercase transition-colors ${isCtaDisabled
                        ? 'bg-black/10 text-black/30 cursor-not-allowed'
                        : 'bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)] hover:bg-black'
                      }`}
                  >
                    {hasVariants && (!selectedSize || !selectedColor) ? 'Select Options' : stockStatus.stock === 0 ? 'Out of Stock' : 'Add'}
                  </button>
                </div>
              </div>
            </div>
          </div>

        <div className="mt-14">
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">You may also like</div>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[color:var(--bv-text)]">
                SIMILAR PRODUCTS
              </h2>
            </div>
            {categoryInfo.id ? (
              <Link
                to={`/category/${categoryInfo.slug || categoryInfo.id}`}
                className="text-xs tracking-[0.18em] uppercase text-[color:var(--bv-muted)] hover:text-[color:var(--bv-text)] transition-colors inline-flex items-center gap-2"
              >
                View All
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : null}
          </div>

          {similarLoading ? (
            <div className="py-10 flex justify-center">
              <div className="flex items-center gap-3">
                <div className="relative h-6 w-6">
                  <div className="absolute inset-0 rounded-full border-2 border-black/10" />
                  <div className="absolute inset-0 rounded-full border-2 border-[color:var(--bv-text)]/70 border-t-transparent animate-spin" />
                </div>
                <span className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Loading</span>
              </div>
            </div>
          ) : similarItems.length ? (
            <>
              <div className="mt-6 hidden sm:grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
                {similarItems.map((p) => (
                  <ProductCard key={p._id || p.id} product={p} />
                ))}
              </div>
              <div className="mt-6 sm:hidden">
                <div className="flex flex-nowrap gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {similarItems.map((p) => (
                    <div key={p._id || p.id} className="shrink-0 w-1/2">
                      <ProductCard product={p} />
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="mt-6 rounded-[2rem] border border-[color:var(--bv-border)] bg-[color:var(--bv-surface)]/60 p-10 text-center">
              <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">No suggestions yet</div>
              <div className="mt-2 text-sm text-[color:var(--bv-text)]">More similar items will appear here.</div>
            </div>
          )}
        </div>
        </div>

        <div className="lg:hidden fixed inset-x-0 bottom-0 z-[60] bg-[color:var(--bv-bg)] border-t border-[color:var(--bv-border)]">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
            <div className="min-w-0">
              <div className="text-xs tracking-[0.22em] uppercase text-[color:var(--bv-muted)]">Price</div>
              <div className="text-lg font-semibold text-[color:var(--bv-text)]">${Number(product.price || 0).toFixed(0)}</div>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isCtaDisabled}
              className={`ml-auto h-12 rounded-2xl px-6 text-xs tracking-[0.18em] uppercase transition-colors ${isCtaDisabled
                  ? 'bg-black/10 text-black/30 cursor-not-allowed'
                  : 'bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)] hover:bg-black'
                }`}
            >
              {hasVariants && (!selectedSize || !selectedColor) ? 'Select Options' : stockStatus.stock === 0 ? 'Out of Stock' : 'Add'}
            </button>
          </div>
        </div>
      </div>
  );
};

export default ProductDetails;
