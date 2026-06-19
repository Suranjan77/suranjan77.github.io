describe('Learning Tracks', () => {
  it('keeps all tracks and rich module previews on the homepage', () => {
    cy.visit('/#curriculum');

    cy.contains('ML Practitioner').should('be.visible');
    cy.contains('ML Practitioner').should('be.visible');
    cy.contains('Modern AI Systems').should('be.visible');

    cy.contains('button', 'Modern AI Systems').click();
    cy.get('#track-modern-ai').within(() => {
      cy.contains('button', 'Neural Networks').click();
      cy.contains('Preview').should('be.visible');
      cy.contains('Key Equation').should('be.visible');
      cy.contains('Open Full Study').should('be.visible');
    });
  });

  it('redirects legacy track URLs to the matching homepage section', () => {
    cy.visit('/tracks/modern-ai');
    cy.location('pathname').should('eq', '/');
    cy.location('hash').should('eq', '#track-modern-ai');
    cy.contains('button', 'Modern AI Systems')
      .should('have.attr', 'aria-expanded', 'true');
  });
});
