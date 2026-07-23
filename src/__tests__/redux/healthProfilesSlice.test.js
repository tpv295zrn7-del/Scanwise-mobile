import reducer, {
  fetchHealthProfile,
  updateHealthProfile,
  addFamilyMember,
  removeFamilyMember,
  selectFamilyMembers,
  selectAllergies,
  setAllergies,
  selectHealthProfile,
  selectLastSyncTime,
} from '@/redux/slices/healthProfilesSlice';
import { configureStore } from '@reduxjs/toolkit';
import * as api from '@/services/api';

jest.mock('@/services/api');
const makeStore = () => configureStore({ reducer: { healthProfiles: reducer } });

describe('healthProfilesSlice', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    api.toUserError.mockReturnValue('Mapped error');
  });

  it('initial state', () => {
    const state = reducer(undefined, { type: 'init' });
    expect(state.profile).toBeNull();
    expect(state.familyMembers).toEqual([]);
  });

  it('fetch success and failure', async () => {
    const store = makeStore();
    api.profileApi.getProfile.mockResolvedValue({ data: { allergies: [], familyMembers: [{ id: '1' }] } });
    await store.dispatch(fetchHealthProfile());
    expect(store.getState().healthProfiles.familyMembers).toHaveLength(1);

    api.profileApi.getProfile.mockRejectedValue(new Error('bad'));
    const res = await store.dispatch(fetchHealthProfile());
    expect(res.type).toContain('rejected');
  });

  it('update merges profile and sync time', async () => {
    const store = makeStore();
    api.profileApi.updateProfile.mockResolvedValue({ data: { goals: ['A'] } });
    await store.dispatch(updateHealthProfile({ goals: ['A'] }));
    expect(store.getState().healthProfiles.profile.goals).toEqual(['A']);
    expect(store.getState().healthProfiles.lastSyncTime).toBeTruthy();

    api.profileApi.updateProfile.mockRejectedValueOnce(new Error('bad'));
    const fail = await store.dispatch(updateHealthProfile({}));
    expect(fail.type).toContain('rejected');
  });

  it('add/remove family member with max 5', () => {
    let state = reducer(undefined, { type: 'init' });
    for (let i = 0; i < 5; i += 1) {
      state = reducer(state, addFamilyMember({ id: `${i}` }));
    }
    state = reducer(state, addFamilyMember({ id: '6' }));
    expect(state.familyMembers).toHaveLength(5);
    state = reducer(state, removeFamilyMember('2'));
    expect(state.familyMembers.find((m) => m.id === '2')).toBeUndefined();
  });

  it('selectors return subset', () => {
    const root = { healthProfiles: { profile: { allergies: ['nuts'] }, familyMembers: [1] } };
    expect(selectFamilyMembers(root)).toEqual([1]);
    expect(selectAllergies(root)).toEqual(['nuts']);
    expect(selectHealthProfile(root)).toEqual({ allergies: ['nuts'] });
  });

  it('setAllergies initializes profile and updates sync selector', async () => {
    const state = reducer(undefined, setAllergies([{ name: 'soy', severity: 'mild' }]));
    expect(state.profile.allergies).toEqual([{ name: 'soy', severity: 'mild' }]);

    const store = makeStore();
    api.profileApi.getProfile.mockResolvedValue({ data: { allergies: [], familyMembers: [] } });
    await store.dispatch(fetchHealthProfile());
    expect(selectLastSyncTime({ healthProfiles: store.getState().healthProfiles })).toBeTruthy();
  });
});
