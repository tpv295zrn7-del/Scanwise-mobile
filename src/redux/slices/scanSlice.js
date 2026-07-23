import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { endpoints } from '../../services/api';

const initialState = {
  currentScan: null,
  loading: false,
  error: null,
  scannedBarcode: null
};

export const scanBarcode = createAsyncThunk('scan/scanBarcode', async (barcode) => {
  const response = await endpoints.scanBarcode({ barcode });
  return { barcode, result: response.data };
});

const scanSlice = createSlice({
  name: 'scan',
  initialState,
  reducers: {
    setCurrentScan: (state, action) => {
      state.currentScan = action.payload;
    },
    clearScanError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(scanBarcode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(scanBarcode.fulfilled, (state, action) => {
        state.loading = false;
        state.scannedBarcode = action.payload.barcode;
        state.currentScan = action.payload.result;
      })
      .addCase(scanBarcode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { setCurrentScan, clearScanError } = scanSlice.actions;

export const selectCurrentScan = (state) => state.scan.currentScan;
export const selectScanState = (state) => state.scan;

export default scanSlice.reducer;
