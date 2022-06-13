import { ConnectorEvents } from '../../src/connectors/common';

describe('Persistor', () => {
  describe(`when connector emits ${ConnectorEvents.ADDRESS_CHANGED}`, () => {
    it('persists the new address to LocalStorage', () => {});
  });
  describe(`when connector emits ${ConnectorEvents.NETWORK_CHANGED}`, () => {
    it('persists the new network to LocalStorage', () => {});
  });
  describe(`when connector emits ${ConnectorEvents.CONNECTED}`, () => {
    it('persists the new wallet type to LocalStorage', () => {});
    it('persists the new network to LocalStorage', () => {});
    it('persists the new address to LocalStorage', () => {});
  });
  describe(`when connector emits ${ConnectorEvents.DISCONNECTED}`, () => {
    it('removes the wallet type from LocalStorage', () => {});
    it('removes the network from LocalStorage', () => {});
    it('removes the address from LocalStorage', () => {});
  });
});
