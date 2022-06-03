/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

const BASE_URL = 'http://localhost:3000';

function openModal() {
  cy.get('button[aria-label="Run Connect wallet to mainnet"]').click();
}

context('Wallet Test Plan', () => {
  beforeEach(() => {
    cy.visit(`${BASE_URL}/wallet-test-plan`);
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

  it('Connects with wallet connect', () => {
    openModal();
    cy.findByText('Celo Wallet').click();

    // cy.get('button[aria-label="Connect with Celo Wallet Web"]').click();

    cy.origin('celowallet.app', () => {
      cy.visit('https://celowallet.app');
      cy.get('button')
        .should('contain.text', 'Create New Account')
        .first()
        .click();
    });
  });
});

export {};
