import { addFamilyMember } from '../redux/slices/healthProfilesSlice';

export const FamilyProfilesScreen = ({ dispatch }) => ({
  add: (member) => dispatch(addFamilyMember(member))
});
