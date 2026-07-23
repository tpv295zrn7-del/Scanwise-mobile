import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { endpoints } from '../../services/api';

const initialState = {
  list: [],
  loading: false,
  error: null,
  selectedIndex: 0
};

export const alternativesThunk = createAsyncThunk(
  'alternatives/fetch',
  async (barcode) => {
    const response = await endpoints.getAlternatives(barcode);
    return response.data;
  }
);

const alternativesSlice = createSlice({
  name: 'alternatives',
  initialState,
  reducers: {
    setAlternatives: (state, action) => {
      state.list = action.payload || [];
      state.selectedIndex = 0;
    },
    setSelectedAlternative: (state, action) => {
      const index = Number(action.payload);
      if (Number.isInteger(index) && index >= 0 && index < state.list.length) {
        state.selectedIndex = index;
      }
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(alternativesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(alternativesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
        state.selectedIndex = 0;
      })
      .addCase(alternativesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { setAlternatives, setSelectedAlternative, clearError } =
  alternativesSlice.actions;

export const selectAlternatives = (state) => state.alternatives.list;
export const selectSelectedAlternative = (state) =>
  state.alternatives.list[state.alternatives.selectedIndex] || null;

export default alternativesSlice.reducer;
