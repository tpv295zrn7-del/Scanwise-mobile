import { confirmPasswordReset } from '../redux/slices/authSlice';
import { validatePassword } from '../services/auth';

export const PasswordResetScreen = ({ dispatch, navigation, token }) => ({
  submit: (password) => {
    if (!validatePassword(password)) return 'Validation failed';
    dispatch(confirmPasswordReset({ token, password }));
    navigation.navigate('Login');
    return 'reset';
  }
});
