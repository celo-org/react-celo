import { ConnectorEvents } from '../connectors/common';
import { Dispatcher } from '../react-celo-provider-state';
import { Connector } from '../types';
import { getApplicationLogger } from './logger';

type Updater = (connector: Connector, dispatch: Dispatcher) => void;

export const updater: Updater = (connector, dispatch) => {
  const logger = getApplicationLogger();
  connector.on(ConnectorEvents.ADDRESS_CHANGED, (address) => {
    dispatch('setAddress', address);
  });
  connector.on(ConnectorEvents.NETWORK_CHANGED, (networkName) => {
    logger.log('Network Changing to', networkName);
    dispatch('setNetworkByName', networkName);
  });
  connector.on(ConnectorEvents.CONNECTED, (params) => {
    logger.log('Updater witnessed connection');
    dispatch('connect', params);
  });

  connector.on(ConnectorEvents.WALLET_CHAIN_CHANGED, (chainId) => {
    logger.log(`Wallet Chain Id is ${chainId}`);
    dispatch('setWalletChainId', chainId);
  });

  connector.on(ConnectorEvents.DISCONNECTED, () => {
    logger.log('Updater witnessed disconnection');
    dispatch('disconnect');
  });
  connector.on(ConnectorEvents.WC_ERROR, (error) => {
    logger.log('Updater witnessed error', error);
    dispatch('setConnectorInitError', error);
  });
};

export default updater;
