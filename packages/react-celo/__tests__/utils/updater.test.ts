import { Alfajores, WalletTypes } from '../../src';
import { ConnectorEvents } from '../../src/connectors/common';
import { updater } from '../../src/utils/updater';
import { ConnectorStub } from './connector-stub';
import { setApplicationLogger } from '../../src/utils/logger';
import { mockLogger } from '../test-logger';
describe('Updater', () => {
  const dispatchStub = jest.fn();
  let connector: ConnectorStub;

  beforeAll(() => setApplicationLogger(mockLogger));
  beforeEach(() => {
    connector = new ConnectorStub(Alfajores);
    updater(connector, dispatchStub);
  });
  afterEach(() => {
    dispatchStub.mockReset();
  });
  describe(`when connector emits ${ConnectorEvents.ADDRESS_CHANGED}`, () => {
    it('dispatches the new address to Reducer', () => {
      connector.testEmit(ConnectorEvents.ADDRESS_CHANGED, '0x12312823y471');
      expect(dispatchStub).toHaveBeenCalledWith('setAddress', '0x12312823y471');
    });
  });
  describe(`when connector emits ${ConnectorEvents.NETWORK_CHANGED}`, () => {
    it('dispatches the new network to Reducer', () => {
      connector.testEmit(ConnectorEvents.NETWORK_CHANGED, 'Polygon');
      expect(dispatchStub).toHaveBeenCalledWith('setNetworkByName', 'Polygon');
    });
  });
  describe(`when connector emits ${ConnectorEvents.CONNECTED}`, () => {
    const params = {
      address: '0x9e81622',
      networkName: 'Celo',
      index: 2,
      privateKey: 'PRIVATE',
      walletType: WalletTypes.PrivateKey,
    };
    beforeEach(() => {
      connector.testEmit(ConnectorEvents.CONNECTED, params);
    });
    it('dispatches connect with appropriate params', () => {
      expect(dispatchStub).toHaveBeenCalledWith('connect', params);
    });
  });
  describe(`when connector emits ${ConnectorEvents.DISCONNECTED}`, () => {
    it('dispatches destroy action', () => {
      connector.testEmit(ConnectorEvents.DISCONNECTED);
      expect(dispatchStub).toHaveBeenCalledWith('destroy');
    });
  });
});
