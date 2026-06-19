describe('Module Navigation E2E Tests', () => {
  it('allows sequence traversal using next/prev buttons', () => {
    // Start at linear-regression
    cy.visit('/algorithms/linear-regression');
    cy.get('aside').should('be.visible');

    // Click Next Topic
    cy.get('a[href="/algorithms/logistic-regression"]').contains('Next Topic').click();

    // Verify we navigated to logistic regression
    cy.url().should('include', '/algorithms/logistic-regression');
    cy.get('h1').should('contain', 'Logistic Regression');

    // Click Previous Topic
    cy.get('a[href="/algorithms/linear-regression"]').contains('Previous Topic').click();

    // Verify we are back to linear-regression
    cy.url().should('include', '/algorithms/linear-regression');
  });

  it('navigates to related modules from the related topics section', () => {
    cy.visit('/algorithms/linear-regression');

    // Click on a related module.
    cy.contains('h3', 'Related Topics')
      .should('exist')
      .parent()
      .find('a[href="/algorithms/logistic-regression"]')
      .click();

    // Verify navigation
    cy.url().should('include', '/algorithms/logistic-regression');
    cy.get('h1').should('contain', 'Logistic Regression');
  });
});
