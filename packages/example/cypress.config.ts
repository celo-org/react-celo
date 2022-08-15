import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    experimentalSessionAndOrigin: true,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  env: {
    deployedURL: 'http://localhost:3000',
  },
});
