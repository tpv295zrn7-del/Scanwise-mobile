import { loginUser } from '../redux/slices/authSlice';
import { validateEmail } from '../services/auth';

export const LoginScreen = ({ dispatch, navigation, state }) => ({
  testID: 'login-screen',
  locked: state?.auth?.isLocked,
  submit: (email, password) => {
    if (!validateEmail(email) || !password) return 'Validation failed';
    dispatch(loginUser({ email, password }));
    return 'submitted';
  },
  goSignup: () => navigation.navigate('Signup'),
  goForgot: () => navigation.navigate('ForgotPassword')
});
