import { CeloTokenContract, ContractKit } from '@celo/contractkit';

import { WalletTypes } from './constants';
import { useContractKitContext } from './contract-kit-provider';
import { Connector, Dapp, Network } from './types';

export interface UseContractKit {
  dapp: Dapp;
  kit: ContractKit;
  walletType: WalletTypes;
  feeCurrency: CeloTokenContract;

  /**
   * Name of the account.
   */
  account: string | null;

  address: string | null;
  connect: () => Promise<Connector>;
  destroy: () => Promise<void>;
  network: Network;
  updateNetwork: (network: Network) => Promise<void>;
  updateFeeCurrency: (newFeeCurrency: CeloTokenContract) => Promise<void>;

  /**
   * Helper function for handling any interaction with a Celo wallet. Perform action will
   * - open the action modal
   * - handle multiple transactions in order
   */
  performActions: (
    ...operations: ((kit: ContractKit) => unknown | Promise<unknown>)[]
  ) => Promise<unknown[]>;

  /**
   * Whether or not the connector has been fully loaded.
   */
  initialised: boolean;
  /**
   * Initialisation error, if applicable.
   */
  initError: Error | null;

  /**
   * Gets the connected instance of ContractKit.
   * If the user is not connected, this opens up the connection modal.
   */
  getConnectedKit: () => Promise<ContractKit>;
}

export const useContractKit = (): UseContractKit => {
  const [
    { dapp, connector, connectorInitError, address, network, feeCurrency },
    _dispatch,
    {
      destroy,
      updateNetwork,
      connect,
      getConnectedKit,
      performActions,
      updateFeeCurrency,
    },
  ] = useContractKitContext();

  return {
    address,
    dapp,
    network,
    updateFeeCurrency,
    updateNetwork,
    kit: connector.kit,
    walletType: connector.type,
    account: connector.account,
    initialised: connector.initialised,
    feeCurrency,

    performActions,
    getConnectedKit,
    connect,
    destroy,

    initError: connectorInitError,
  };
};

interface UseContractKitInternal extends UseContractKit {
  connectionCallback: ((connector: Connector | false) => void) | null;
  initConnector: (connector: Connector) => Promise<Connector>;
  pendingActionCount: number;
}

/**
 * useContractKit with internal methods exposed. Package use only.
 */
export const useContractKitInternal = (): UseContractKitInternal => {
  const [
    { pendingActionCount, connectionCallback },
    _dispatch,
    { initConnector },
  ] = useContractKitContext();

  return {
    ...useContractKit(),
    connectionCallback,
    initConnector,
    pendingActionCount,
  };
};
