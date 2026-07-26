import { createSlice } from '@reduxjs/toolkit';
import { scanProductByBarcode, lookupProductByBarcode } from '../thunks/scanThunk';

const initialState = {
  currentScan: null,
  scanHistory: [],
  loading: false,
  error: null,
  productLoading: false,
  productData: null,
  productError: null,
  productNotFound: false,
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
    },
    clearProductLookup: (state) => {
      state.productLoading = false;
      state.productData = null;
      state.productError = null;
      state.productNotFound = false;
    },
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
      })
      .addCase(lookupProductByBarcode.pending, (state) => {
        state.productLoading = true;
        state.productError = null;
        state.productNotFound = false;
        state.productData = null;
      })
      .addCase(lookupProductByBarcode.fulfilled, (state, action) => {
        state.productLoading = false;
        state.productData = action.payload;
        state.productNotFound = false;
      })
      .addCase(lookupProductByBarcode.rejected, (state, action) => {
        state.productLoading = false;
        state.productError = action.error.message;
        state.productNotFound =
          action.error.message === 'PRODUCT_NOT_FOUND';
      });
  },
});

export const { setCurrentScan, addToHistory, clearError, clearProductLookup } =
  scansSlice.actions;

export const selectScansState = (state) => state.scans;
export const selectCurrentScan = (state) => state.scans.currentScan;
export const selectScanHistory = (state) => state.scans.scanHistory;
export const selectScansLoading = (state) => state.scans.loading;
export const selectScansError = (state) => state.scans.error;
export const selectProductLoading = (state) => state.scans.productLoading;
export const selectProductData = (state) => state.scans.productData;
export const selectProductError = (state) => state.scans.productError;
export const selectProductNotFound = (state) => state.scans.productNotFound;

export default scansSlice.reducer;
