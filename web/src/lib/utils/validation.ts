export const isValidEmail = (input: string) => {
  return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(input);
};

export const isValidPassword = (input: string) => {
  return input.length >= 6;
};

export const isValidBirthdate = (input: string) => {
  const date = new Date(input);

  const isInvalidDate = isNaN(date.getTime());

  if (isInvalidDate) {
    return false;
  }

  // Check if the date string is not the same date as parsed date
  // (to catch cases like '2000-02-30', which result in a valid date)
  if (date.toISOString().substring(0, 10) !== input) {
    return false;
  }

  const now = new Date();

  return date < now;
};
