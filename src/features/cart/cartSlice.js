import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
};

const buildKey = ({ productId, size, color }) => {
  const safeSize = size ?? '';
  const safeColor = color ?? '';
  return `${productId}:${safeSize}:${safeColor}`;
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action) => {
      const {
        productId,
        name,
        price,
        image,
        slug,
        quantity = 1,
        size,
        color,
        stock,
      } = action.payload;

      const key = buildKey({ productId, size, color });
      const existing = state.items.find((i) => i.key === key);
      const safeQty = Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1;

      if (existing) {
        const nextQty = existing.quantity + safeQty;
        existing.quantity = typeof stock === 'number' ? Math.min(nextQty, stock) : nextQty;
        if (typeof stock === 'number') existing.stock = stock;
        if (name) existing.name = name;
        if (typeof price === 'number') existing.price = price;
        if (image) existing.image = image;
        if (slug) existing.slug = slug;
        return;
      }

      state.items.push({
        key,
        productId,
        name,
        price,
        image,
        slug,
        quantity: typeof stock === 'number' ? Math.min(safeQty, stock) : safeQty,
        size: size ?? null,
        color: color ?? null,
        stock: typeof stock === 'number' ? stock : null,
      });
    },
    removeItem: (state, action) => {
      state.items = state.items.filter((i) => i.key !== action.payload);
    },
    setQuantity: (state, action) => {
      const { key, quantity } = action.payload;
      const item = state.items.find((i) => i.key === key);
      if (!item) return;
      const safeQty = Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1;
      item.quantity = typeof item.stock === 'number' ? Math.min(safeQty, item.stock) : safeQty;
    },
    increment: (state, action) => {
      const item = state.items.find((i) => i.key === action.payload);
      if (!item) return;
      const nextQty = item.quantity + 1;
      item.quantity = typeof item.stock === 'number' ? Math.min(nextQty, item.stock) : nextQty;
    },
    decrement: (state, action) => {
      const item = state.items.find((i) => i.key === action.payload);
      if (!item) return;
      item.quantity = Math.max(1, item.quantity - 1);
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addItem, removeItem, setQuantity, increment, decrement, clearCart } = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
export const selectCartSubtotal = (state) =>
  state.cart.items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);

export default cartSlice.reducer;
