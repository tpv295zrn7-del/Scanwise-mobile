export const profileSelectors = {
  profile: (state) => state.healthProfiles.profile,
  familyMembers: (state) => state.healthProfiles.familyMembers,
  allergies: (state) => state.healthProfiles.profile?.allergies ?? [],
};
