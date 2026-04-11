import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authAPI } from "../../services/api";

export const login = createAsyncThunk("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await authAPI.login(credentials);
    localStorage.setItem("shopx_token", data.token);
    localStorage.setItem("shopx_user", JSON.stringify(data.user));
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || "Login failed"); }
});

export const register = createAsyncThunk("auth/register", async (userData, { rejectWithValue }) => {
  try {
    const { data } = await authAPI.register(userData);
    localStorage.setItem("shopx_token", data.token);
    localStorage.setItem("shopx_user", JSON.stringify(data.user));
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || "Registration failed"); }
});

export const fetchMe = createAsyncThunk("auth/fetchMe", async (_, { rejectWithValue }) => {
  try {
    const { data } = await authAPI.getMe();
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const getUserFromStorage = () => {
  try { return JSON.parse(localStorage.getItem("shopx_user")); } catch { return null; }
};

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: getUserFromStorage(),
    token: localStorage.getItem("shopx_token"),
    loading: false,
    error: null,
    isAuthenticated: !!localStorage.getItem("shopx_token"),
  },
  reducers: {
    logout: (state) => {
      state.user = null; state.token = null; state.isAuthenticated = false;
      localStorage.removeItem("shopx_token"); localStorage.removeItem("shopx_user");
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const handlePending = (state) => { state.loading = true; state.error = null; };
    const handleFulfilled = (state, action) => {
      state.loading = false;
      state.user = action.payload.user || action.payload;
      if (action.payload.token) state.token = action.payload.token;
      state.isAuthenticated = true;
      if (action.payload.user) localStorage.setItem("shopx_user", JSON.stringify(action.payload.user));
    };
    const handleRejected = (state, action) => { state.loading = false; state.error = action.payload; };
    builder
      .addCase(login.pending, handlePending).addCase(login.fulfilled, handleFulfilled).addCase(login.rejected, handleRejected)
      .addCase(register.pending, handlePending).addCase(register.fulfilled, handleFulfilled).addCase(register.rejected, handleRejected)
      .addCase(fetchMe.fulfilled, (state, action) => { state.user = action.payload; localStorage.setItem("shopx_user", JSON.stringify(action.payload)); });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
