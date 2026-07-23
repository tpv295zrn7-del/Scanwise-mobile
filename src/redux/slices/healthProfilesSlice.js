import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { endpoints } from '../../services/api';

const MAX_FAMILY_MEMBERS = 5;

const initialState = {
  profile: { allergies: [], familyMembers: [], goals: [] },
  status: 'idle',
  error: null,
  lastSyncedAt: null
};

export const fetchHealthProfile = createAsyncThunk(
  'health/fetchProfile',
  async () => {
    const response = await endpoints.getProfile();
    return response.data;
  }
);

export const updateHealthProfile = createAsyncThunk(
  'health/updateProfile',
  async (payload) => {
    const response = await endpoints.updateProfile(payload);
    return response.data;
  }
);

const healthProfilesSlice = createSlice({
  name: 'healthProfiles',
  initialState,
  reducers: {
    addFamilyMember: (state, action) => {
      if (state.profile.familyMembers.length < MAX_FAMILY_MEMBERS) {
        state.profile.familyMembers.push(action.payload);
      }
    },
    removeFamilyMember: (state, action) => {
      state.profile.familyMembers = state.profile.familyMembers.filter(
        (m) => m.id !== action.payload
      );
    },
    setAllergenSeverity: (state, action) => {
      const { name, severity } = action.payload;
      const existing = state.profile.allergies.find((a) => a.name === name);
      if (existing) existing.severity = severity;
      else state.profile.allergies.push({ name, severity });
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHealthProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchHealthProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload;
        state.lastSyncedAt = new Date().toISOString();
      })
      .addCase(fetchHealthProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(updateHealthProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.lastSyncedAt = new Date().toISOString();
      });
  }
});

export const { addFamilyMember, removeFamilyMember, setAllergenSeverity } =
  healthProfilesSlice.actions;
export const selectHealthProfile = (state) => state.healthProfiles.profile;
export const selectFamilyMembers = (state) =>
  state.healthProfiles.profile.familyMembers;
export const selectAllergies = (state) =>
  state.healthProfiles.profile.allergies;
export const selectSyncMetadata = (state) => ({
  status: state.healthProfiles.status,
  lastSyncedAt: state.healthProfiles.lastSyncedAt
});

export default healthProfilesSlice.reducer;
