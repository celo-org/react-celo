import { Alfajores, DEFAULT_NETWORKS } from '../../src';
import { ConnectorEvents } from '../../src/connectors';
import { setApplicationLogger } from '../../src/utils/logger';
import networkWatcher from '../../src/utils/network-watcher';
import { mockLogger } from '../test-logger';
import { ConnectorStub } from './connector-stub';

describe('networkWatcher', () => {
  let connector: ConnectorStub;

  beforeAll(() => setApplicationLogger(mockLogger));
  beforeEach(() => {
    connector = new ConnectorStub(Alfajores);
    jest.spyOn(connector, 'continueNetworkUpdateFromWallet');
  });
  describe('when networks includes one with matching chainID', () => {
    describe('when manualNetworkMode is false', () => {
      it('calls continueNetworkUpdateFrom wallet on the connector', () => {
        networkWatcher(connector, DEFAULT_NETWORKS, false);
        connector.testEmit(
          ConnectorEvents.WALLET_CHAIN_CHANGED,
          Alfajores.chainId
        );
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(connector.continueNetworkUpdateFromWallet).toBeCalledWith(
          Alfajores
        );
      });
    });
    describe('when manualNetworkMode is true', () => {
      it('makes no call', () => {
        networkWatcher(connector, DEFAULT_NETWORKS, true);
        connector.testEmit(
          ConnectorEvents.WALLET_CHAIN_CHANGED,
          Alfajores.chainId
        );
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(connector.continueNetworkUpdateFromWallet).not.toBeCalled();
      });
    });
  });
  describe('when networks does not include any with the chainID', () => {
    it('makes no call', () => {
      networkWatcher(connector, DEFAULT_NETWORKS, false);
      connector.testEmit(ConnectorEvents.WALLET_CHAIN_CHANGED, 1);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(connector.continueNetworkUpdateFromWallet).not.toBeCalled();
    });
  });
});
