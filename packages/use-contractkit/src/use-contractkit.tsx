import { CeloTokenContract } from '@celo/contractkit/lib/base';
import { MiniContractKit } from '@celo/contractkit/lib/mini-kit';

import { WalletTypes } from './constants';
import { useContractKitContext } from './contract-kit-provider';
import { Connector, Dapp, Network } from './types';

export interface UseContractKit {
  dapp: Dapp;
  kit: MiniContractKit;
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
  networks: readonly Network[];
  updateNetwork: (network: Network) => Promise<void>;
  updateFeeCurrency: (newFeeCurrency: CeloTokenContract) => Promise<void>;
  supportsFeeCurrency: boolean;
  /**
   * Helper function for handling any interaction with a Celo wallet. Perform action will
   * - open the action modal
   * - handle multiple transactions in order
   */
  performActions: (
    ...operations: ((kit: MiniContractKit) => unknown | Promise<unknown>)[]
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
   * Gets the connected instance of MiniContractKit.
   * If the user is not connected, this opens up the connection modal.
   */
  getConnectedKit: () => Promise<MiniContractKit>;

  contractsCache?: unknown;
}

export function useContractKit<CC = undefined>(): UseContractKit {
  const [
    {
      dapp,
      connector,
      connectorInitError,
      address,
      network,
      feeCurrency,
      networks,
    },
    _dispatch,
    {
      destroy,
      updateNetwork,
      connect,
      getConnectedKit,
      performActions,
      updateFeeCurrency,
      contractsCache,
    },
  ] = useContractKitContext();

  return {
    address,
    dapp,
    network,
    // Copy to ensure any accidental mutations dont affect global state
    networks: networks.map((net) => ({ ...net })),
    updateNetwork,
    kit: connector.kit,
    contractsCache: contractsCache as CC,
    walletType: connector.type,
    account: connector.account,
    initialised: connector.initialised,
    feeCurrency,
    updateFeeCurrency,
    supportsFeeCurrency: connector.supportsFeeCurrency(),
    performActions,
    getConnectedKit,
    connect,
    destroy,

    initError: connectorInitError,
  };
}

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
