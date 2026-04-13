import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  lastOrder: null,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setLastOrder: (state, action) => {
      state.lastOrder = action.payload;
    },
    clearLastOrder: (state) => {
      state.lastOrder = null;
    },
  },
});

export const { setLastOrder, clearLastOrder } = ordersSlice.actions;
export const selectLastOrder = (state) => state.orders.lastOrder;

export default ordersSlice.reducer;
