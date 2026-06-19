describe('Search E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('allows user to query and see suggestions in a dropdown', () => {
    // Find the search input
    cy.get('input[placeholder="Search modules..."]').as('searchInput');
    
    // Type a query
    cy.get('@searchInput').type('Linear Regression');

    // Wait for the dropdown to render the matching items
    cy.contains('Matching Modules').should('be.visible');
    cy.contains('Linear Regression').should('be.visible');
  });

  it('navigates to the corresponding module page when a suggestion is clicked', () => {
    cy.get('input[placeholder="Search modules..."]').type('Logistic Regression');
    
    // Click on the result
    cy.contains('Matching Modules')
      .parent()
      .contains('Logistic Regression')
      .click();

    // Verify page routing
    cy.url().should('include', '/algorithms/logistic-regression');
    cy.get('h1').should('contain', 'Logistic Regression');
  });

  it('displays a friendly "no results" message for unmatched queries', () => {
    cy.get('input[placeholder="Search modules..."]').type('nonexistentconcept123');

    // Dropdown should open and display no results message
    cy.contains(/No results found for.*nonexistentconcept123/i).should('be.visible');
  });

  it('clears query and closes dropdown when clear button is clicked', () => {
    cy.get('input[placeholder="Search modules..."]').type('Linear Regression');
    cy.contains('Matching Modules').should('be.visible');

    // Click on the clear (X) button
    cy.get('button').find('svg').parent().click();

    // Query should be empty and dropdown should be closed
    cy.get('input[placeholder="Search modules..."]').should('have.value', '');
    cy.contains('Matching Modules').should('not.exist');
  });
});
