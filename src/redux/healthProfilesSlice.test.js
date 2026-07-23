import reducer, {
  fetchHealthProfile,
  updateHealthProfile,
  addFamilyMember,
  removeFamilyMember,
  setAllergenSeverity,
  selectSyncMetadata
} from './slices/healthProfilesSlice';
import { configureStore } from '@reduxjs/toolkit';
import * as api from '../services/api';

jest.mock('../services/api', () => ({
  endpoints: { getProfile: jest.fn(), updateProfile: jest.fn() }
}));

describe('healthProfilesSlice', () => {
  const store = () => configureStore({ reducer: { healthProfiles: reducer } });
  test('fetch and update', async () => {
    api.endpoints.getProfile.mockResolvedValue({
      data: { allergies: [], familyMembers: [], goals: [] }
    });
    api.endpoints.updateProfile.mockResolvedValue({
      data: {
        allergies: [{ name: 'nuts', severity: 'high' }],
        familyMembers: [],
        goals: []
      }
    });
    const s = store();
    await s.dispatch(fetchHealthProfile());
    await s.dispatch(updateHealthProfile({}));
    expect(selectSyncMetadata(s.getState()).lastSyncedAt).toBeTruthy();
  });
  test('fetch failure stores error', async () => {
    api.endpoints.getProfile.mockRejectedValueOnce(new Error('boom'));
    const s = store();
    await s.dispatch(fetchHealthProfile());
    expect(s.getState().healthProfiles.status).toBe('failed');
  });
  test('family member limit and remove', () => {
    const s = store();
    for (let i = 0; i < 6; i += 1)
      s.dispatch(addFamilyMember({ id: String(i) }));
    expect(s.getState().healthProfiles.profile.familyMembers).toHaveLength(5);
    s.dispatch(removeFamilyMember('1'));
    expect(
      s
        .getState()
        .healthProfiles.profile.familyMembers.find((m) => m.id === '1')
    ).toBeFalsy();
  });
  test('set allergen severity', () => {
    const s = store();
    s.dispatch(setAllergenSeverity({ name: 'dairy', severity: 'low' }));
    s.dispatch(setAllergenSeverity({ name: 'dairy', severity: 'high' }));
    expect(s.getState().healthProfiles.profile.allergies[0].severity).toBe(
      'high'
    );
  });
});
