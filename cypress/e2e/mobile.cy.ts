describe('Mobile Viewport', () => {
  beforeEach(() => {
    cy.viewport(360, 640);
  });

  const expectNoHorizontalOverflow = () => {
    cy.document().then((doc) => {
      expect(doc.documentElement.scrollWidth).to.be.lte(
        doc.documentElement.clientWidth + 1,
      );
    });
  };

  it('renders the homepage without horizontal overflow', () => {
    cy.visit('/');
    expectNoHorizontalOverflow();
  });

  it('renders a lesson without horizontal overflow', () => {
    cy.visit('/algorithms/calculus');
    cy.get('h1').should('exist');
    expectNoHorizontalOverflow();
  });

  it('keeps visualization SVGs within the viewport', () => {
    cy.visit('/algorithms/calculus');
    cy.get('svg').each(($svg) => {
      expect($svg[0].getBoundingClientRect().width).to.be.lte(360);
    });
  });
});
