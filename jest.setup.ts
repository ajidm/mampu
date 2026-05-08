import "@testing-library/jest-dom";

// Suppress intentional console.error calls from error-boundary components under test
jest.spyOn(console, "error").mockImplementation(() => {});
