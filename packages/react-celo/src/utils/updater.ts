import {
  AbstractConnector,
  ConnectorEvents,
  ConnectorParams,
} from '../connectors/common';

type Updater = (
  connector: AbstractConnector,
  dispatch: (action: string, payload?: unknown) => void
) => void;

export const updater: Updater = (connector: AbstractConnector, dispatch) => {
  connector.on(ConnectorEvents.ADDRESS_CHANGED, (address) => {
    dispatch('setAddress', address);
  });
  connector.on(ConnectorEvents.NETWORK_CHANGED, (networkName) => {
    dispatch('setNetwork', networkName);
  });
  connector.on(ConnectorEvents.CONNECTED, (params: ConnectorParams) => {
    // TODO create a 'connected' action to dispatch
    dispatch('connect', params);
  });

  connector.on(ConnectorEvents.DISCONNECTED, () => {
    dispatch('destroy');
  });
};
