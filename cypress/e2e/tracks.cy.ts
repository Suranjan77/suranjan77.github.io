describe('Tracks E2E Tests', () => {
  it('displays all learning tracks and counts modules', () => {
    cy.visit('/tracks');
    cy.get('h1').should('contain', 'Curated Learning Tracks');
    
    // Check that our 3 standard tracks are present
    cy.contains('Mathematical Foundations').should('exist');
    cy.contains('ML Practitioner').should('exist');
    cy.contains('Modern AI').should('exist');
  });

  it('navigates to a track detail page and shows modules in sequence', () => {
    cy.visit('/tracks');
    
    // Click on Foundations track
    cy.contains('Mathematical Foundations').click();
    
    // URL should update
    cy.url().should('include', '/tracks/foundations');
    cy.get('h1').should('contain', 'Mathematical Foundations');
    
    // Should list modules (e.g. calculus, linear algebra)
    cy.contains('Calculus').should('exist');
    cy.contains('Linear Algebra').should('exist');
    
    // Click back to tracks
    cy.contains('Back to Tracks').click();
    cy.url().should('include', '/tracks');
  });

  it('shows 404/not-found on an invalid track ID', () => {
    cy.visit('/tracks/nonexistent-track-id', { failOnStatusCode: false });
    cy.contains(/not found|404/i).should('exist');
  });
});
