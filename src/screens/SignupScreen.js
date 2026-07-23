import { signupUser } from '../redux/slices/authSlice';
import {
  passwordStrength,
  validateEmail,
  validatePassword
} from '../services/auth';

export const SignupScreen = ({ dispatch, navigation }) => ({
  testID: 'signup-screen',
  strength: (password) => passwordStrength(password),
  submit: (email, password, confirm, terms) => {
    if (
      !terms ||
      !validateEmail(email) ||
      !validatePassword(password) ||
      password !== confirm
    ) {
      return 'Validation failed';
    }
    dispatch(signupUser({ email, password }));
    navigation.navigate('Home');
    return 'submitted';
  }
});
