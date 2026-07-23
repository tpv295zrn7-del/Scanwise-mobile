import { validateEmail, validatePassword } from '@/services/auth';

export const validateLoginForm = ({ email, password }) => {
  const errors = {};

  if (!validateEmail(email)) {
    errors.email = 'Enter a valid email.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  }

  return errors;
};

export const validateSignupForm = ({ email, password, confirmPassword, acceptedTerms }) => {
  const errors = validateLoginForm({ email, password });
  const passwordResult = validatePassword(password);

  if (!passwordResult.isValid) {
    errors.password = passwordResult.errors[0];
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords must match.';
  }

  if (!acceptedTerms) {
    errors.acceptedTerms = 'Please accept the terms.';
  }

  return errors;
};
