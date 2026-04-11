import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { cartAPI } from "../../services/api";

export const fetchCart = createAsyncThunk("cart/fetch", async (_, { rejectWithValue }) => {
  try { const { data } = await cartAPI.get(); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const addToCart = createAsyncThunk("cart/add", async ({ productId, quantity = 1 }, { rejectWithValue }) => {
  try { const { data } = await cartAPI.add(productId, quantity); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || "Failed to add to cart"); }
});

export const updateCartItem = createAsyncThunk("cart/update", async ({ itemId, quantity }, { rejectWithValue }) => {
  try { const { data } = await cartAPI.update(itemId, quantity); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const removeFromCart = createAsyncThunk("cart/remove", async (itemId, { rejectWithValue }) => {
  try { const { data } = await cartAPI.remove(itemId); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const clearCart = createAsyncThunk("cart/clear", async (_, { rejectWithValue }) => {
  try { await cartAPI.clear(); return { items: [] }; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const getLocalCart = () => {
  try { return JSON.parse(localStorage.getItem("shopx_local_cart")) || []; } catch { return []; }
};

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    localItems: getLocalCart(),
    loading: false,
    error: null,
  },
  reducers: {
    addLocalItem: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const existing = state.localItems.find(i => i.productId === product._id);
      if (existing) existing.quantity += quantity;
      else state.localItems.push({ productId: product._id, product, quantity, price: product.price });
      localStorage.setItem("shopx_local_cart", JSON.stringify(state.localItems));
    },
    removeLocalItem: (state, action) => {
      state.localItems = state.localItems.filter(i => i.productId !== action.payload);
      localStorage.setItem("shopx_local_cart", JSON.stringify(state.localItems));
    },
    updateLocalItem: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.localItems.find(i => i.productId === productId);
      if (item) { if (quantity <= 0) state.localItems = state.localItems.filter(i => i.productId !== productId); else item.quantity = quantity; }
      localStorage.setItem("shopx_local_cart", JSON.stringify(state.localItems));
    },
    clearLocalCart: (state) => {
      state.localItems = [];
      localStorage.removeItem("shopx_local_cart");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, (state, action) => { state.loading = false; state.items = action.payload?.items || []; })
      .addCase(fetchCart.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(addToCart.fulfilled, (state, action) => { state.items = action.payload?.items || []; })
      .addCase(updateCartItem.fulfilled, (state, action) => { state.items = action.payload?.items || []; })
      .addCase(removeFromCart.fulfilled, (state, action) => { state.items = action.payload?.items || []; })
      .addCase(clearCart.fulfilled, (state) => { state.items = []; });
  },
});

export const { addLocalItem, removeLocalItem, updateLocalItem, clearLocalCart } = cartSlice.actions;
export const selectCartItemCount = (state) => state.cart.items.reduce((sum, i) => sum + i.quantity, 0);
export const selectCartTotal = (state) => state.cart.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
export default cartSlice.reducer;
