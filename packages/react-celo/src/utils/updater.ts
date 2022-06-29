import { ConnectorEvents } from '../connectors/common';
import { Dispatcher } from '../react-celo-provider-state';
import { Connector } from '../types';

type Updater = (connector: Connector, dispatch: Dispatcher) => void;

export const updater: Updater = (connector, dispatch) => {
  connector.on(ConnectorEvents.ADDRESS_CHANGED, (address) => {
    dispatch('setAddress', address);
  });
  connector.on(ConnectorEvents.NETWORK_CHANGED, (networkName) => {
    console.info('Network Changing to', networkName);
    dispatch('setNetworkByName', networkName);
  });
  connector.on(ConnectorEvents.CONNECTED, (params) => {
    dispatch('connect', params);
  });

  connector.on(ConnectorEvents.DISCONNECTED, () => {
    dispatch('destroy');
  });
};

export default updater;
