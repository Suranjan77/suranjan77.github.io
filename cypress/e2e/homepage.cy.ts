describe('Homepage E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('displays the main header and description', () => {
    cy.get('h1').should('contain', 'Understand AI, Mathematically');
    cy.get('p').should('contain', 'structured curriculum');
  });

  it('lists all modules in the curriculum grid', () => {
    // There should be a good number of module cards visible
    cy.get('[id^="card-"]').should('have.length.greaterThan', 30);
  });

  it('expands a module card to show preview details when clicked', () => {
    // The first card starts expanded, so open a different module.
    cy.get('[id^="card-"]').eq(1).click();

    // The expanded panel should now be visible and contain detail sections
    cy.contains('Preview').should('be.visible');
    cy.contains('Key Equation').should('be.visible');
    cy.contains('Open Full Study').should('be.visible');
  });

  it('navigates to the full study page when "Open Full Study" is clicked', () => {
    // The responsive curriculum grid reflows once its client-side column count
    // is known, so wait for that hydration pass before locating the link.
    cy.wait(500);
    cy.get('a[href^="/algorithms/"]')
      .contains('Open Full Study')
      .should('be.visible')
      .click();

    // It should navigate to the module details page
    cy.url().should('include', '/algorithms/');
    cy.get('h1').should('exist');
    cy.contains('Intuition').should('exist');
  });
});
