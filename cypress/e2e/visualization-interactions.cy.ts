describe('Visualization Interactions', () => {
  beforeEach(() => {
    cy.visit('/algorithms/linear-regression');
    cy.contains('Interactive Diagram').scrollIntoView().should('be.visible');
    cy.get('svg[aria-label="Multivariable Linear Regression Fit"]').should('exist');
  });

  it('updates a range control without crashing', () => {
    cy.get('input[type="range"]').first().then(($slider) => {
      const min = Number($slider.attr('min') ?? 0);
      const max = Number($slider.attr('max') ?? 100);
      cy.wrap($slider)
        .invoke('val', (min + max) / 2)
        .trigger('input')
        .trigger('change');
    });

    cy.get('svg[aria-label="Multivariable Linear Regression Fit"]').should('be.visible');
    cy.contains('Visualization Error').should('not.exist');
  });

  it('fits and resets the visualization', () => {
    cy.get('button[aria-label="Fit the weights with gradient descent"]').click();
    cy.get('button[aria-label="Reset the weights"]').click();
    cy.contains('Visualization Error').should('not.exist');
  });
});
