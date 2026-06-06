describe('Visualization Interactions', () => {
  beforeEach(() => {
    cy.visit('/algorithms/gradient-descent');
    cy.contains('Interactive Diagram').scrollIntoView().should('be.visible');
    cy.get('svg[aria-label="Gradient Descent Trajectory Visualizer"]').should('exist');
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

    cy.get('svg[aria-label="Gradient Descent Trajectory Visualizer"]').should('be.visible');
    cy.contains('Visualization Error').should('not.exist');
  });

  it('changes a select control without crashing', () => {
    cy.get('select').first().then(($select) => {
      const nextValue = $select.find('option').eq(1).val();
      cy.wrap($select).select(String(nextValue));
    });

    cy.get('svg[aria-label="Gradient Descent Trajectory Visualizer"]').should('be.visible');
    cy.contains('Visualization Error').should('not.exist');
  });

  it('runs and resets the visualization', () => {
    cy.get('button[aria-label="Run optimization path"]').click();
    cy.get('button[aria-label="Pause optimization path"]').should('exist');
    cy.get('button[aria-label="Reset trajectory to start position"]').click();
    cy.contains('Visualization Error').should('not.exist');
  });
});
