describe('All Modules Walkthrough', () => {
  it('visits all algorithm pages to verify they render without crashes', () => {
    cy.visit('/');
    
    // Gather all algorithm URLs from card IDs, including collapsed cards.
    const urls: string[] = [];
    cy.get('[id^="card-"]').each(($el) => {
      const id = $el.attr('id');
      const slug = id?.replace(/^card-/, '');
      if (slug) urls.push(`/algorithms/${slug}`);
    }).then(() => {
      expect(urls).to.have.length(40);
      cy.log(`Crawling ${urls.length} modules...`);
      
      // Visit each URL and perform lightweight sanity checks
      urls.forEach((url) => {
        cy.visit(url);
        
        // Page should render a title
        cy.get('h1').should('exist').and('not.be.empty');
        
        // Ensure no build error or routing crash
        cy.get('#__next-build-error').should('not.exist');
        
        // Page should contain an Interactive Diagram header
        cy.contains('Interactive Diagram').should('exist');
        
        // The visualization container should render correctly
        cy.get('svg, [data-testid="visualization"]').should('exist');
        cy.get('[role="img"][aria-label]').should('exist');
        cy.get('[data-testid="visualization-error"]').should('not.exist');
        cy.get('[data-testid="visualization"]')
          .invoke('text')
          .should('not.match', /\b(?:NaN|Infinity)\b/);
      });
    });
  });
});
