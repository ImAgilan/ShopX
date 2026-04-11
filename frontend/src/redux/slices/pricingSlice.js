import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { pricingAPI } from "../../services/api";

export const fetchPricingConfig = createAsyncThunk("pricing/fetchConfig", async (_, { rejectWithValue }) => {
  try { const { data } = await pricingAPI.getConfig(); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchDistricts = createAsyncThunk("pricing/fetchDistricts", async (_, { rejectWithValue }) => {
  try { const { data } = await pricingAPI.getDistricts(); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const calculateTotal = createAsyncThunk("pricing/calculate", async (payload, { rejectWithValue }) => {
  try { const { data } = await pricingAPI.calculateTotal(payload); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateTaxCharges = createAsyncThunk("pricing/updateTax", async (taxCharges, { rejectWithValue }) => {
  try { const { data } = await pricingAPI.updateTaxCharges(taxCharges); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateDistrictFees = createAsyncThunk("pricing/updateDistricts", async (payload, { rejectWithValue }) => {
  try { const { data } = await pricingAPI.updateDistrictFees(payload); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateInternational = createAsyncThunk("pricing/updateIntl", async (payload, { rejectWithValue }) => {
  try { const { data } = await pricingAPI.updateInternational(payload); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const pricingSlice = createSlice({
  name: "pricing",
  initialState: {
    config: null,
    districts: [],
    calculation: null,
    loading: false,
    calculating: false,
    error: null,
  },
  reducers: {
    clearCalculation: (state) => { state.calculation = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPricingConfig.pending, (s) => { s.loading = true; })
      .addCase(fetchPricingConfig.fulfilled, (s, a) => { s.loading = false; s.config = a.payload; })
      .addCase(fetchPricingConfig.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchDistricts.fulfilled, (s, a) => { s.districts = a.payload; })
      .addCase(calculateTotal.pending, (s) => { s.calculating = true; })
      .addCase(calculateTotal.fulfilled, (s, a) => { s.calculating = false; s.calculation = a.payload; })
      .addCase(calculateTotal.rejected, (s) => { s.calculating = false; })
      .addCase(updateTaxCharges.fulfilled, (s, a) => { if (s.config) s.config.taxCharges = a.payload; })
      .addCase(updateDistrictFees.fulfilled, (s, a) => { if (s.config) s.config.localDelivery = a.payload; })
      .addCase(updateInternational.fulfilled, (s, a) => { if (s.config) s.config.internationalDelivery = a.payload; });
  },
});

export const { clearCalculation } = pricingSlice.actions;
export default pricingSlice.reducer;
