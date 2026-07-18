import "@testing-library/jest-dom"; // to be able to use advanced assertions such as `expect(...).toHaveAttribute(...)`
// See https://github.com/testing-library/jest-dom?tab=readme-ov-file#usage
// For some reason, placing this import in 'setupJest.js' causes a 'ReferenceError: expect is not defined'.
// Placing it in this dedicated file solves the issue.
