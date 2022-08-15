import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    experimentalSessionAndOrigin: true,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  env: {
    BASE_URL: '1',
  },
});
