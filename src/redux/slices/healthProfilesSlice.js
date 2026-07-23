import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { profileApi, toUserError } from '@/services/api';
import { MAX_FAMILY_MEMBERS } from '@/utils/constants';

const initialState = {
  profile: null,
  familyMembers: [],
  loading: false,
  error: null,
  lastSyncTime: null,
};

export const fetchHealthProfile = createAsyncThunk('healthProfiles/fetchHealthProfile', async (_, { rejectWithValue }) => {
  try {
    const response = await profileApi.getProfile();
    return response.data;
  } catch (error) {
    return rejectWithValue(toUserError(error));
  }
});

export const updateHealthProfile = createAsyncThunk(
  'healthProfiles/updateHealthProfile',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await profileApi.updateProfile(payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(toUserError(error));
    }
  }
);

const healthProfilesSlice = createSlice({
  name: 'healthProfiles',
  initialState,
  reducers: {
    addFamilyMember: (state, action) => {
      if (state.familyMembers.length < MAX_FAMILY_MEMBERS) {
        state.familyMembers.push(action.payload);
      } else {
        state.error = 'Maximum family members reached.';
      }
    },
    removeFamilyMember: (state, action) => {
      state.familyMembers = state.familyMembers.filter((member) => member.id !== action.payload);
    },
    setAllergies: (state, action) => {
      state.profile = state.profile ?? {};
      state.profile.allergies = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHealthProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHealthProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.familyMembers = action.payload.familyMembers ?? [];
        state.lastSyncTime = new Date().toISOString();
      })
      .addCase(fetchHealthProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error.message;
      })
      .addCase(updateHealthProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateHealthProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = {
          ...(state.profile ?? {}),
          ...action.payload,
        };
        state.lastSyncTime = new Date().toISOString();
      })
      .addCase(updateHealthProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error.message;
      });
  },
});

export const { addFamilyMember, removeFamilyMember, setAllergies } = healthProfilesSlice.actions;

export const selectHealthProfileState = (state) => state.healthProfiles;
export const selectHealthProfile = (state) => state.healthProfiles.profile;
export const selectFamilyMembers = (state) => state.healthProfiles.familyMembers;
export const selectAllergies = (state) => state.healthProfiles.profile?.allergies ?? [];
export const selectLastSyncTime = (state) => state.healthProfiles.lastSyncTime;

export default healthProfilesSlice.reducer;
