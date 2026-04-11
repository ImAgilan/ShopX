import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchSiteSettings = createAsyncThunk('site/fetchSettings', async () => {
  const { data } = await api.get('/settings')
  return data.data
})

export const fetchLayoutConfig = createAsyncThunk('site/fetchLayout', async () => {
  const { data } = await api.get('/settings/layout')
  return data.data
})

export const updateSiteSettings = createAsyncThunk('site/updateSettings', async (settings, { rejectWithValue }) => {
  try {
    const { data } = await api.put('/settings', settings)
    return data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const updateLayoutConfig = createAsyncThunk('site/updateLayout', async (sections, { rejectWithValue }) => {
  try {
    const { data } = await api.put('/settings/layout', { sections })
    return data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

const siteSlice = createSlice({
  name: 'site',
  initialState: {
    settings: null,
    layout: null,
    currency: 'LKR',
    loading: false,
    error: null,
  },
  reducers: {
    setCurrency: (state, action) => { state.currency = action.payload },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSiteSettings.fulfilled, (state, action) => {
        state.settings = action.payload
        state.currency = action.payload.currency
        applyTheme(action.payload)
      })
      .addCase(fetchLayoutConfig.fulfilled, (state, action) => { state.layout = action.payload })
      .addCase(updateSiteSettings.fulfilled, (state, action) => {
        state.settings = action.payload
        applyTheme(action.payload)
      })
      .addCase(updateLayoutConfig.fulfilled, (state, action) => { state.layout = action.payload })
  },
})

function applyTheme(settings) {
  const root = document.documentElement
  if (settings.primaryColor) root.style.setProperty('--primary-color', settings.primaryColor)
  if (settings.secondaryColor) root.style.setProperty('--secondary-color', settings.secondaryColor)
  if (settings.accentColor) root.style.setProperty('--accent-color', settings.accentColor)
  if (settings.fontFamily) root.style.setProperty('--font-family', settings.fontFamily)
  if (settings.themeMode === 'dark') document.documentElement.classList.add('dark')
  else document.documentElement.classList.remove('dark')
  if (settings.siteName) document.title = settings.siteName
}

export const { setCurrency } = siteSlice.actions
export default siteSlice.reducer
