import { CeloTransactionObject } from '@celo/connect';
import { ContractKit } from '@celo/contractkit';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import ReactModal from 'react-modal';
import { createContainer } from 'unstated-next';
import {
  Alfajores,
  localStorageKeys,
  Mainnet,
  NetworkNames,
  WalletTypes,
} from './constants';
import {
  CeloExtensionWalletConnector,
  DappKitConnector,
  LedgerConnector,
  PrivateKeyConnector,
  UnauthenticatedConnector,
} from './connectors';
import { ActionModal, ActionModalProps, ConnectModal } from './modals';
import { Network, Provider, Connector } from './types';

let lastUsedNetworkName = Mainnet.name;
let lastUsedAddress = '';
let lastUsedWalletType = WalletTypes.Unauthenticated;
let lastUsedWalletArguments: any[] = [];
function localStorageOperations() {
  if (typeof localStorage === 'undefined') {
    return;
  }

  const localLastUsedNetworkName = localStorage.getItem(
    localStorageKeys.lastUsedNetwork
  );
  if (localLastUsedNetworkName) {
    lastUsedNetworkName = localLastUsedNetworkName as NetworkNames;
  }

  const localLastUsedAddress = localStorage.getItem(
    localStorageKeys.lastUsedAddress
  );
  if (localLastUsedAddress) {
    lastUsedAddress = localLastUsedAddress;
  }

  const localLastUsedWalletType = localStorage.getItem(
    localStorageKeys.lastUsedWalletType
  );
  if (localLastUsedWalletType) {
    lastUsedWalletType = localLastUsedWalletType as WalletTypes;
  }

  const localLastUsedWalletArguments = localStorage.getItem(
    localStorageKeys.lastUsedWalletArguments
  );
  if (localLastUsedWalletArguments) {
    lastUsedWalletArguments = JSON.parse(localLastUsedWalletArguments);
  }
}
localStorageOperations();

const defaultNetworks = [Mainnet, Alfajores];
const lastUsedNetwork =
  defaultNetworks.find((n) => n.name === lastUsedNetworkName) || Alfajores;

const connectorTypes: { [x in WalletTypes]: any } = {
  [WalletTypes.Unauthenticated]: UnauthenticatedConnector,
  [WalletTypes.PrivateKey]: PrivateKeyConnector,
  [WalletTypes.Ledger]: LedgerConnector,
  [WalletTypes.WalletConnect]: null,
  [WalletTypes.CeloExtensionWallet]: CeloExtensionWalletConnector,
  [WalletTypes.Metamask]: null,
  [WalletTypes.DappKit]: DappKitConnector,
};

let initialConnector: Connector;
if (lastUsedWalletType) {
  try {
    initialConnector = new connectorTypes[lastUsedWalletType as WalletTypes](
      lastUsedNetwork,
      ...lastUsedWalletArguments
    );
  } catch (e) {
    initialConnector = new UnauthenticatedConnector(lastUsedNetwork);
  }
}

interface ConnectionResult {
  type: WalletTypes;
  connector: Connector;
}

function Kit(
  { networks }: { networks?: Network[] } = {
    networks: defaultNetworks,
  }
) {
  const [address, setAddress] = useState(lastUsedAddress);
  const [connectionCallback, setConnectionCallback] = useState<
    ((x: ConnectionResult | false) => void) | null
  >(null);

  const initialNetwork = (networks || defaultNetworks).find(
    (n) => n.name === lastUsedNetworkName
  );
  if (!initialNetwork) {
    throw new Error('Unknown network');
  }

  const [connection, setConnection] = useState<Connector>(initialConnector);
  const [network, updateNetwork] = useState(
    initialNetwork || defaultNetworks[0]
  );
  const [pendingActionCount, setPendingActionCount] = useState(0);

  useEffect(() => {
    const account = connection.kit.defaultAccount;
    if (account) {
      setAddress(account);
      localStorage.setItem(localStorageKeys.lastUsedAddress, account);
    }
  }, [connection.kit]);

  useEffect(() => {
    if (
      localStorage.getItem(localStorageKeys.lastUsedNetwork) === network.name
    ) {
      return;
    }
    localStorage.setItem(localStorageKeys.lastUsedNetwork, network.name);

    // setKit((k) => {
    //   const existingWallet = k.getWallet();
    //   if (!existingWallet) {
    //     return newKit(network.rpcUrl);
    //   }

    //   const nk = newKit(network.rpcUrl, existingWallet);
    //   nk.defaultAccount = existingWallet.getAccounts()[0];
    //   return nk;
    // });
  }, [network]);

  const destroy = useCallback(() => {
    localStorage.removeItem(localStorageKeys.lastUsedAddress);
    localStorage.removeItem(localStorageKeys.lastUsedWalletType);
    localStorage.removeItem(localStorageKeys.lastUsedWalletArguments);

    setAddress('');
    setConnection(new UnauthenticatedConnector(network));
  }, [network]);

  const connect = async (): Promise<Connector> => {
    const connectionResultPromise = new Promise((resolve, reject) => {
      const connectionResultCallback = (
        x:
          | {
              type: WalletTypes;
              connector: Connector;
            }
          | false
      ) => resolve(x);

      // has to be like this and not like setConnectionCallback(connectionResultCallback)
      // as React will try to run any function passed to set state
      setConnectionCallback(() => connectionResultCallback);
    });

    const result = (await connectionResultPromise) as ConnectionResult | false;
    if (result === false) {
      // dismissed
      setConnectionCallback(null);
      throw new Error('Connection cancelled');
    }

    setConnection(result.connector);
    setConnectionCallback(null);

    return result.connector;
  };

  /**
   * Helper function for handling any interaction with a Celo wallet. Perform action will
   *    - open the action modal
   *    - handle multiple transactions in order
   */
  const performActions = useCallback(
    async (...operations: ((kit: ContractKit) => any | Promise<any>)[]) => {
      let initialisedConnection = connection;
      if (connection.type === WalletTypes.Unauthenticated) {
        initialisedConnection = await connect();
      } else if (!initialisedConnection.initialised) {
        await initialisedConnection.initialise();
      }

      console.log(initialisedConnection);

      setPendingActionCount(operations.length);

      const results = [];
      for (const op of operations) {
        try {
          results.push(await op(initialisedConnection.kit));
        } catch (e) {
          setPendingActionCount(0);
          throw e;
        }

        setPendingActionCount((c) => c - 1);
      }

      return results;
    },
    [connect]
  );

  /**
   * Helper function for handling any interaction with the Celo network. `sendTransaction` will
   *    - open the action modal
   *    - configure the gas price minimum correctly
   *    - pay the fee in a currency that the account has
   */
  const sendTransaction = useCallback(
    async (
      tx:
        | CeloTransactionObject<any>
        | CeloTransactionObject<any>[]
        | Promise<CeloTransactionObject<any>>
        | Promise<CeloTransactionObject<any>[]>,
      sendOpts: any = {}
    ) => {
      const [gasPriceMinimum, celo, cusd /* ceur */] = await Promise.all([
        connection.kit.contracts.getGasPriceMinimum(),
        connection.kit.contracts.getGoldToken(),
        connection.kit.contracts.getStableToken(),
      ]);
      const [
        minGasPrice,
        celoBalance,
        cusdBalance /* ceurBalance */,
      ] = await Promise.all([
        gasPriceMinimum.gasPriceMinimum(),
        celo.balanceOf(address),
        cusd.balanceOf(address),
      ]);

      const gasPrice = minGasPrice.times(1.5);
      const feeCurrency = celoBalance.gt(0)
        ? undefined // celo.address
        : cusdBalance.gt(0)
        ? cusd.address
        : undefined;

      const resolved = await tx;
      const txs = Array.isArray(resolved) ? resolved : [resolved];

      return performActions(
        ...txs.map((tx) => () =>
          tx.sendAndWaitForReceipt({
            from: address,
            gasPrice: gasPrice.toString(),
            feeCurrency,
            ...sendOpts,
          })
        )
      );
    },
    [connection.kit, address, performActions]
  );

  return {
    network,
    updateNetwork,

    address,
    kit: connection.kit,
    destroy,

    connect,

    pendingActionCount,

    send: sendTransaction,
    sendTransaction,
    performActions,

    connectionCallback,
  };
}

const KitState = createContainer(Kit);
export const useContractKit = KitState.useContainer;

export function ContractKitProvider({
  children,
  connectModal,
  actionModal,
  dappName,
  networks,
}: {
  children: ReactNode;
  dappName: string;
  networks?: Network[];

  connectModal?: {
    renderProvider?: (p: Provider & { onClick: () => void }) => ReactNode;
    reactModalProps?: Partial<ReactModal.Props>;
  };
  actionModal?: {
    reactModalProps?: Partial<ReactModal.Props>;
    render?: (props: ActionModalProps) => ReactNode;
  };
}) {
  return (
    <KitState.Provider initialState={{ networks }}>
      <ConnectModal dappName={dappName} {...connectModal} />
      <ActionModal dappName={dappName} {...actionModal} />

      {children}
    </KitState.Provider>
  );
}
