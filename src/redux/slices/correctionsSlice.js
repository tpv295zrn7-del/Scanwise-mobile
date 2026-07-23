import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { endpoints } from '../../services/api';

const initialState = {
  submissions: [],
  loading: false,
  error: null,
  submitted: false
};

export const submitCorrection = createAsyncThunk(
  'corrections/submitCorrection',
  async ({ barcode, correction }) => {
    const payload = { barcode, ...correction };
    const response = await endpoints.submitCorrection(payload);
    return response.data || payload;
  }
);

const correctionsSlice = createSlice({
  name: 'corrections',
  initialState,
  reducers: {
    addSubmission: (state, action) => {
      state.submissions.push(action.payload);
      state.submitted = true;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearSubmitted: (state) => {
      state.submitted = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitCorrection.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.submitted = false;
      })
      .addCase(submitCorrection.fulfilled, (state, action) => {
        state.loading = false;
        state.submitted = true;
        state.submissions.push(action.payload);
      })
      .addCase(submitCorrection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { addSubmission, setLoading, setError, clearSubmitted } =
  correctionsSlice.actions;

export const selectSubmissions = (state) => state.corrections.submissions;
export const selectSubmissionStatus = (state) => ({
  loading: state.corrections.loading,
  error: state.corrections.error,
  submitted: state.corrections.submitted
});

export default correctionsSlice.reducer;
