import { requestPasswordReset } from '../redux/slices/authSlice';
import { validateEmail } from '../services/auth';

export const ForgotPasswordScreen = ({ dispatch }) => ({
  submit: (email) => {
    if (!validateEmail(email)) return 'Validation failed';
    dispatch(requestPasswordReset(email));
    return 'sent';
  }
});
