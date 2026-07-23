import { updateHealthProfile } from '../redux/slices/healthProfilesSlice';

export const ReviewProfileScreen = ({ dispatch, profile }) => ({
  complete: () => dispatch(updateHealthProfile(profile))
});
