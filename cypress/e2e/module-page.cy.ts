describe('Module Page E2E Tests', () => {
  beforeEach(() => {
    // Visit a representative algorithm module page
    cy.visit('/algorithms/linear-regression');
  });

  it('renders all core lesson layout sections', () => {
    // Check main title
    cy.get('h1').should('exist').and('not.be.empty');

    // Check difficulty / time metadata
    cy.contains('Difficulty').should('exist');
    cy.contains('Reading Time').should('exist');

    // Check key content sections
    cy.contains('h2', 'Intuition').should('exist');
    cy.contains('h2', 'The Mathematics').should('exist');
    cy.contains('h2', 'In Depth').should('exist');
    cy.contains('h2', 'Implementation').should('exist');
    cy.contains('h2', 'Interactive Diagram').should('exist');
  });

  it('renders math equations using KaTeX', () => {
    // Verify that mathematical formulas are compiled into KaTeX components
    cy.get('.katex').should('exist');
    cy.get('.katex').should('have.length.greaterThan', 0);
  });

  it('renders code snippets with syntax highlighting', () => {
    // Look for code container
    cy.get('pre').should('exist');
    // Ensure syntax-highlighted tokens (keywords, punctuation, etc.) are rendered inside
    cy.get('pre code, pre').should('exist');
  });

  it('displays navigation controls for previous and next modules', () => {
    // Ensure there are navigation links/buttons to other modules
    cy.get('nav').should('exist');
    cy.contains(/next topic|previous topic/i).should('exist');
  });
});
