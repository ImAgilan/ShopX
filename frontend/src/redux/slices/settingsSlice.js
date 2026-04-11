import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { settingsAPI } from "../../services/api";

export const fetchSiteSettings = createAsyncThunk("settings/fetch", async () => {
  const { data } = await settingsAPI.get();
  return data.data;
});

export const fetchLayoutConfig = createAsyncThunk("settings/fetchLayout", async () => {
  const { data } = await settingsAPI.getLayout();
  return data.data;
});

export const updateSiteSettings = createAsyncThunk("settings/update", async (settingsData, { rejectWithValue }) => {
  try { const { data } = await settingsAPI.update(settingsData); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateLayoutConfig = createAsyncThunk("settings/updateLayout", async (sections, { rejectWithValue }) => {
  try { const { data } = await settingsAPI.updateLayout(sections); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const defaultSettings = {
  siteName: "Shop-X", primaryColor: "#E63946", secondaryColor: "#1D3557",
  accentColor: "#F4A261", themeMode: "light", currency: "LKR",
  currencySymbol: "Rs.", usdRate: 320, fontFamily: "Plus Jakarta Sans",
};

const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    site: defaultSettings,
    layout: null,
    currency: localStorage.getItem("shopx_currency") || "LKR",
    loading: false,
    error: null,
  },
  reducers: {
    setCurrency: (state, action) => {
      state.currency = action.payload;
      localStorage.setItem("shopx_currency", action.payload);
    },
    applyTheme: (state) => { /* Colors hardcoded in CSS — no-op in orange theme */ return;
      const { primaryColor, secondaryColor, accentColor, themeMode, fontFamily } = state.site;
      document.documentElement.style.setProperty("--color-primary", primaryColor);
      document.documentElement.style.setProperty("--color-secondary", secondaryColor);
      document.documentElement.style.setProperty("--color-accent", accentColor);
      document.documentElement.style.setProperty("--font-family", fontFamily || "Plus Jakarta Sans");
      if (themeMode === "dark") document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSiteSettings.fulfilled, (state, action) => { state.site = action.payload; state.loading = false; })
      .addCase(fetchSiteSettings.pending, (state) => { state.loading = true; })
      .addCase(fetchLayoutConfig.fulfilled, (state, action) => { state.layout = action.payload; })
      .addCase(updateSiteSettings.fulfilled, (state, action) => { state.site = action.payload; })
      .addCase(updateLayoutConfig.fulfilled, (state, action) => { state.layout = action.payload; });
  },
});

export const { setCurrency, applyTheme } = settingsSlice.actions;
export default settingsSlice.reducer;
