/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

function openModal() {
  cy.get('button[aria-label="Run Connect wallet to mainnet"]').click();
}

context('Wallet Test Plan', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const baseUrl: string = Cypress.env('deployedURL');
    const fixedUrl = baseUrl.replace('/', '-');
    cy.visit(`http://${fixedUrl}/wallet-test-plan`);
  });

  it('searches', () => {
    openModal();
    cy.findByText('Valora').should('exist');
    cy.findByText('WalletConnect').should('exist');
    cy.findByText('Celo Wallet').should('exist');

    cy.get('input[role="search"]').type('Celo');

    cy.findByText('Celo Wallet').should('exist');
    cy.findByText('Valora').should('not.exist');
    cy.findByText('WalletConnect').should('not.exist');

    cy.get('input[role="search"]').clear();
  });

  it('Connects with Private Key', () => {
    openModal();
    cy.findByText('Private key').click();

    cy.get('textarea').type(
      'e2d7138baa3a5600ac37984e40981591d7cf857bcadd7dc6f7d14023a17b0787'
    );
    cy.findByText('Submit').click();

    cy.findByText('Connected to').should('exist');

    cy.findAllByText('success').should('have.length', 1);
  });
});

export {};
