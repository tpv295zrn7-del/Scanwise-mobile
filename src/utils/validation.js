export const validateEmail = (email) =>
  /^(?:[a-zA-Z0-9_'^&/+-])+(?:\.(?:[a-zA-Z0-9_'^&/+-])+)*@(?:(?:[a-zA-Z0-9-])+\.)+[a-zA-Z]{2,}$/.test(
    email
  );

export const validatePassword = (password) =>
  /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);

export const validatePhone = (phone) => /^\+?[1-9]\d{7,14}$/.test(phone);
