export const isValidEmail = (email: string): boolean => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email) && email.length <= 100;
};

export const isValidPassword = (password: string): boolean => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password); 
  const hasLowerCase = /[a-z]/.test(password); 
  const hasNumbers = /\d/.test(password); 
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>_-]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChars
  );
};

export const nicknameValidator = (name: string): boolean => { 
  return name.length >= 3 && name.length <= 20;
};

export const isValidName = (name: string): boolean => {
  return name.length >= 3 && name.length <= 100;
};