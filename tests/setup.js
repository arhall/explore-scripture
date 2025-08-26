// Test setup file
global.console = {
  ...console,
  // Suppress console.warn in tests unless needed
  warn: jest.fn(),
  error: jest.fn(),
};