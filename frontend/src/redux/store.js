import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import settingsReducer from "./slices/settingsSlice";
import pricingReducer from "./slices/pricingSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    settings: settingsReducer,
    pricing: pricingReducer,
  },
});
