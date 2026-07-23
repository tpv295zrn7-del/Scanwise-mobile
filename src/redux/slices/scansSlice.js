import { createSlice } from '@reduxjs/toolkit';
import { scanProductByBarcode } from '../thunks/scanThunk';

const initialState = {
  currentScan: null,
  scanHistory: [],
  loading: false,
  error: null
};

const scansSlice = createSlice({
  name: 'scans',
  initialState,
  reducers: {
    setCurrentScan: (state, action) => {
      state.currentScan = action.payload;
    },
    addToHistory: (state, action) => {
      if (action.payload) {
        state.scanHistory.unshift(action.payload);
      }
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(scanProductByBarcode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(scanProductByBarcode.fulfilled, (state, action) => {
        state.loading = false;
        state.currentScan = action.payload;
        state.scanHistory.unshift(action.payload);
      })
      .addCase(scanProductByBarcode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { setCurrentScan, addToHistory, clearError } = scansSlice.actions;

export const selectScansState = (state) => state.scans;
export const selectCurrentScan = (state) => state.scans.currentScan;
export const selectScanHistory = (state) => state.scans.scanHistory;
export const selectScansLoading = (state) => state.scans.loading;
export const selectScansError = (state) => state.scans.error;

export default scansSlice.reducer;
