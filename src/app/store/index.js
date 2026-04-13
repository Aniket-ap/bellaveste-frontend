import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '../../features/cart/cartSlice';
import ordersReducer from '../../features/orders/ordersSlice';

const STORAGE_KEY = 'bellaveste_store_v1';

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
};

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    orders: ordersReducer,
  },
  preloadedState: loadState(),
});

store.subscribe(() => {
  try {
    const state = store.getState();
    const persist = {
      cart: state.cart,
      orders: state.orders,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persist));
  } catch {
    void 0;
  }
});
