describe('Active Learning Features', () => {
  beforeEach(() => {
    // Visit a representative math/algorithm module page with full active learning features
    cy.visit('/algorithms/calculus');
  });

  it('renders Practice Exercises, Case Studies, and Self-Check Quiz sections', () => {
    cy.contains('h3', 'Practice Exercises').should('exist');
    cy.contains('h3', 'Real-World Case Studies').should('exist');
    cy.contains('h3', 'Check Your Understanding').should('exist');
  });

  it('allows revealing solutions in Practice Exercises', () => {
    // Wait for Next.js hydration
    cy.wait(2000);

    // Find the first exercise
    cy.contains('h4', 'Exercise 1').parents('.rounded-lg').as('exercise');
    
    // Initially solution block should not be visible
    cy.get('@exercise').contains('.tracking-wider', 'Solution').should('not.exist');
    
    // Click reveal
    cy.get('@exercise').contains('button', 'Reveal Solution').click();
    
    // Solution should now be visible
    cy.get('@exercise').contains('.tracking-wider', 'Solution').should('exist');
    
    // Click hide
    cy.get('@exercise').contains('button', 'Hide Solution').click();
    cy.get('@exercise').contains('.tracking-wider', 'Solution').should('not.exist');
  });

  it('handles quiz selection and reveals explanation', () => {
    // Wait for Next.js hydration
    cy.wait(2000);

    // Find the first question card
    cy.contains('.font-mono', 'Q1').parents('.rounded-lg').as('question');
    
    // Explanation should not exist yet
    cy.get('@question').contains('.tracking-wider', 'Explanation').should('not.exist');
    
    // Click the first option
    cy.get('@question').find('button[role="radio"]').first().click({ force: true });
    
    // Explanation should now be revealed
    cy.get('@question').contains('.tracking-wider', 'Explanation').should('exist');
    
    // State indicators "Correct" or "Your pick" should show up
    cy.get('@question').invoke('text').should('match', /Correct|Your pick/);
    
    // Try again button should work
    cy.get('@question').contains('button', 'Try again').click({ force: true });
    cy.get('@question').contains('.tracking-wider', 'Explanation').should('not.exist');
  });
});
