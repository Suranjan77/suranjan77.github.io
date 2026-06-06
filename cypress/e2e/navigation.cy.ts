describe('Module Navigation E2E Tests', () => {
  it('allows sequence traversal using next/prev buttons', () => {
    // Start at linear-algebra
    cy.visit('/algorithms/linear-algebra');
    cy.get('aside').should('be.visible');

    // Click Next Topic
    cy.get('a[href="/algorithms/probability-theory"]').contains('Next Topic').click();

    // Verify we navigated to probability theory
    cy.url().should('include', '/algorithms/probability-theory');
    cy.get('h1').should('contain', 'Probability');

    // Click Previous Topic
    cy.get('a[href="/algorithms/linear-algebra"]').contains('Previous Topic').click();

    // Verify we are back to linear-algebra
    cy.url().should('include', '/algorithms/linear-algebra');
  });

  it('navigates to related modules from the related topics section', () => {
    cy.visit('/algorithms/calculus');

    // Click on a related module.
    cy.contains('h3', 'Related Topics')
      .should('exist')
      .parent()
      .find('a[href="/algorithms/linear-algebra"]')
      .click();

    // Verify navigation
    cy.url().should('include', '/algorithms/linear-algebra');
    cy.get('h1').should('contain', 'Linear Algebra');
  });
});
