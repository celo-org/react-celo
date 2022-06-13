import {
  AbstractConnector,
  ConnectorEvents,
} from '../../src/connectors/common';
import { updater } from '../../src/utils/updater';

class ConnectorStub extends AbstractConnector {
  emit(event: ConnectorEvents, args?: unknown) {
    this.emitter.emit(event, args);
  }
}

describe('Updater', () => {
  const dispatchStub = jest.fn();
  let connector: ConnectorStub;
  beforeEach(() => {
    connector = new ConnectorStub();
    updater(connector, dispatchStub);
  });
  afterEach(() => {
    dispatchStub.mockReset();
  });
  describe(`when connector emits ${ConnectorEvents.ADDRESS_CHANGED}`, () => {
    it('dispatches the new address to Reducer', () => {
      connector.emit(ConnectorEvents.ADDRESS_CHANGED, '0x12312823y471');
      expect(dispatchStub).toHaveBeenCalledWith('setAddress', '0x12312823y471');
    });
  });
  describe(`when connector emits ${ConnectorEvents.NETWORK_CHANGED}`, () => {
    it('dispatches the new network to Reducer', () => {
      connector.emit(ConnectorEvents.NETWORK_CHANGED, 'Polygon');
      expect(dispatchStub).toHaveBeenCalledWith('setNetwork', 'Polygon');
    });
  });
  describe(`when connector emits ${ConnectorEvents.CONNECTED}`, () => {
    const params = {
      address: '0x9e81622',
      networkName: 'Celo',
      index: 2,
      privateKey: 'PRIVATE',
    };
    beforeEach(() => {
      connector.emit(ConnectorEvents.CONNECTED, params);
    });
    it('dispatches connect with appropriate params', () => {
      expect(dispatchStub).toHaveBeenCalledWith('connect', params);
    });
  });
  describe(`when connector emits ${ConnectorEvents.DISCONNECTED}`, () => {
    it('dispatches destroy action', () => {
      connector.emit(ConnectorEvents.DISCONNECTED);
      expect(dispatchStub).toHaveBeenCalledWith('destroy');
    });
  });
});
