export const isValidEmail = (input: string) => {
  return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(input);
};

export const isValidPassword = (input: string) => {
  return input.length >= 6;
};
