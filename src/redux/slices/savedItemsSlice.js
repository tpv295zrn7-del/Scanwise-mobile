import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { endpoints } from '../../services/api';
import {
  addSavedItemToCache,
  loadSavedItemsCache,
  removeSavedItemFromCache,
  saveSavedItemsCache
} from '../../services/persistenceService';

const initialState = {
  items: [],
  loading: false,
  error: null
};

export const fetchSavedItems = createAsyncThunk('savedItems/fetch', async () => {
  const cachedItems = await loadSavedItemsCache();
  if (cachedItems.length) {
    endpoints
      .getSavedItems()
      .then((response) => saveSavedItemsCache(response.data || []))
      .catch(() => null);
    return cachedItems;
  }

  const response = await endpoints.getSavedItems();
  const items = response.data || [];
  await saveSavedItemsCache(items);
  return items;
});

export const addToSavedItems = createAsyncThunk(
  'savedItems/addToSavedItems',
  async (product) => {
    await addSavedItemToCache(product);
    const response = await endpoints.addSavedItem(product);
    return response.data || product;
  }
);

export const removeSavedItem = createAsyncThunk(
  'savedItems/removeSavedItem',
  async (productId) => {
    await removeSavedItemFromCache(productId);
    await endpoints.removeSavedItem(productId);
    return productId;
  }
);

const savedItemsSlice = createSlice({
  name: 'savedItems',
  initialState,
  reducers: {
    addItem: (state, action) => {
      const exists = state.items.some((item) => item.id === action.payload.id);
      if (!exists) {
        state.items.push(action.payload);
      }
    },
    removeItem: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    setSavedItems: (state, action) => {
      state.items = action.payload || [];
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSavedItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSavedItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchSavedItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addToSavedItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToSavedItems.fulfilled, (state, action) => {
        state.loading = false;
        const exists = state.items.some((item) => item.id === action.payload.id);
        if (!exists) {
          state.items.push(action.payload);
        }
      })
      .addCase(addToSavedItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(removeSavedItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeSavedItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(removeSavedItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { addItem, removeItem, setSavedItems, clearError } =
  savedItemsSlice.actions;

export const selectSavedItems = (state) => state.savedItems.items;
export const selectIsSaved = (productId) => (state) =>
  state.savedItems.items.some((item) => item.id === productId);

export default savedItemsSlice.reducer;
