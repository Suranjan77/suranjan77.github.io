// Global setup for all E2E tests
// Add custom commands here in the future

// Suppress uncaught exceptions from the app that would fail tests
Cypress.on('uncaught:exception', (err) => {
  // Return false to prevent Cypress from failing the test on app errors
  // We will have specific tests for error handling instead
  if (
    err.message.includes('NEXT_NOT_FOUND') ||
    err.message.includes('negative time stamp') ||
    err.message.includes('AlgorithmPage')
  ) {
    return false;
  }
  return true;
});
