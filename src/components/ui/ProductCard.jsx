import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addItem } from '../../features/cart/cartSlice';
import { cartApi } from '../../services/api/cartApi';
import { wishlistApi } from '../../services/api/wishlistApi';

export const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isQuickOpen, setIsQuickOpen] = useState(false);
  const rootRef = useRef(null);

  const getCleanImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/300?text=No+Image';
    return url.replace(/`/g, '').trim();
  };

  const imageUrl = getCleanImageUrl(product.imageCover);
  const hasVariants = Boolean(product.variants?.length);
  const isInStock = (product.totalStock || 0) > 0;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isInStock || hasVariants) return;

    const productId = product.id || product._id || product.slug;
    const price = typeof product.price === 'number' ? product.price : Number(product.price || 0);

    const token = localStorage.getItem('token');
    if (token) {
      try {
        cartApi.addToCart({
          productId,
          quantity: 1,
        });
      } catch (err) {
        void err;
      }
    }

    dispatch(
      addItem({
        productId,
        name: product.name,
        price,
        image: imageUrl,
        slug: product.slug,
        quantity: 1,
        size: null,
        color: null,
        stock: typeof product.totalStock === 'number' ? product.totalStock : null,
      })
    );
  };

  useEffect(() => {
    if (!isQuickOpen) return;
    const onDown = (e) => {
      const root = rootRef.current;
      if (!root) return;
      if (!root.contains(e.target)) setIsQuickOpen(false);
    };
    window.addEventListener('pointerdown', onDown);
    return () => window.removeEventListener('pointerdown', onDown);
  }, [isQuickOpen]);

  const onWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const productId = product.id || product._id || product.slug;
    try {
      await wishlistApi.add(productId);
    } catch (err) {
      void err;
    }
    setIsQuickOpen(false);
  };

  return (
    <div ref={rootRef} className="group relative">
      <div className="relative rounded-3xl border border-[color:var(--bv-border)] bg-[color:var(--bv-surface-strong)] overflow-hidden hover:border-[color:var(--bv-border-strong)] transition-colors">
        <Link to={`/product/${product.slug}`} className="block">
          <div className="aspect-[4/5] w-full overflow-hidden">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </Link>

        {isQuickOpen ? (
          <div className="absolute left-0 right-0 bottom-16 flex justify-center px-4">
            <div className="w-full max-w-[260px] rounded-2xl border border-white/10 bg-[color:var(--bv-pill-bg)]/95 backdrop-blur shadow-[var(--bv-shadow)] p-2">
              <button
                type="button"
                onClick={(e) => {
                  if (hasVariants) {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/product/${product.slug}`);
                    setIsQuickOpen(false);
                    return;
                  }
                  handleQuickAdd(e);
                  setIsQuickOpen(false);
                }}
                disabled={!hasVariants && !isInStock}
                className={`w-full rounded-xl px-3 py-2 text-xs tracking-[0.18em] uppercase transition-colors ${
                  hasVariants
                    ? 'bg-white text-black hover:bg-white/90'
                    : isInStock
                      ? 'bg-white text-black hover:bg-white/90'
                      : 'bg-white/20 text-white/40 cursor-not-allowed'
                }`}
              >
                {hasVariants ? 'Select Options' : 'Add To Cart'}
              </button>
              <button
                type="button"
                onClick={onWishlist}
                className="mt-2 w-full rounded-xl border border-white/20 bg-white/0 px-3 py-2 text-xs tracking-[0.18em] uppercase text-white hover:bg-white/10 hover:border-white/30 transition-colors"
              >
                Wishlist
              </button>
            </div>
          </div>
        ) : null}

        <div className="absolute left-0 right-0 bottom-3 flex justify-center">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsQuickOpen((v) => !v);
            }}
            className="h-11 w-11 rounded-full bg-[color:var(--bv-pill-bg)] text-[color:var(--bv-pill-text)] shadow-[var(--bv-shadow)] flex items-center justify-center hover:bg-black transition-colors"
          >
            <span className="sr-only">Quick actions</span>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </div>

      <div className="pt-4">
        <Link to={`/product/${product.slug}`}>
          <div className="text-sm font-semibold text-[color:var(--bv-text)] line-clamp-1" title={product.name}>
            {product.name}
          </div>
        </Link>
        <div className="mt-1 text-xs tracking-wide text-[color:var(--bv-muted)]">
          ${Number(product.price || 0).toFixed(2)}
        </div>
      </div>
    </div>
  );
};
