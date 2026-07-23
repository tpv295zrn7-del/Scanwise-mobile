import { setAllergenSeverity } from '../redux/slices/healthProfilesSlice';

export const AllergySetupScreen = ({ dispatch }) => ({
  setSeverity: (name, severity) =>
    dispatch(setAllergenSeverity({ name, severity }))
});
