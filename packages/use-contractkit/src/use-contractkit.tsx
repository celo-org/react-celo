import { ContractKit, newKit } from '@celo/contractkit';
import { CeloTransactionObject } from '@celo/connect';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import ReactModal from 'react-modal';
import { createContainer } from 'unstated-next';
import { localStorageKeys, Alfajores, Mainnet } from './constants';
import { fromPrivateKey } from './create-kit';
import { ActionModal, ActionModalProps, ConnectModal } from './modals';
import { Network, Provider } from './types';

const lastUsedNetworkName =
  typeof localStorage !== 'undefined' &&
  localStorage.getItem(localStorageKeys.lastUsedNetwork);
const lastUsedAddress =
  (typeof localStorage !== 'undefined' &&
    localStorage.getItem(localStorageKeys.lastUsedAddress)) ||
  '';

const defaultNetworks = [Mainnet, Alfajores];
const lastUsedNetwork =
  defaultNetworks.find((n) => n.name === lastUsedNetworkName) || Alfajores;

const savedPrivateKey =
  typeof localStorage !== 'undefined' &&
  localStorage.getItem(localStorageKeys.privateKey);
const initialKit = savedPrivateKey
  ? fromPrivateKey(lastUsedNetwork, savedPrivateKey)
  : newKit(lastUsedNetwork?.rpcUrl);

function Kit(
  { networks }: { networks?: Network[] } = {
    networks: defaultNetworks,
  }
) {
  const [address, setAddress] = useState(lastUsedAddress);
  const [initialised, setInitialised] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const initialNetwork = (networks || defaultNetworks).find(
    (n) => n.name === lastUsedNetworkName
  );
  const [network, updateNetwork] = useState(
    initialNetwork || defaultNetworks[0]
  );
  const [pendingActionCount, setPendingActionCount] = useState(0);

  const [kit, setKit] = useState(initialKit);

  useEffect(() => {
    if (kit.defaultAccount) {
      setAddress(kit.defaultAccount);
      localStorage.setItem(
        localStorageKeys.lastUsedAddress,
        kit.defaultAccount
      );
    }
  }, [kit.defaultAccount]);

  useEffect(() => {
    if (
      localStorage.getItem(localStorageKeys.lastUsedNetwork) === network.name
    ) {
      return;
    }

    localStorage.setItem(localStorageKeys.lastUsedNetwork, network.name);
    setKit((k) => {
      const existingWallet = k.getWallet();
      if (!existingWallet) {
        return newKit(network.rpcUrl);
      }

      const nk = newKit(network.rpcUrl, existingWallet);
      nk.defaultAccount = existingWallet.getAccounts()[0];
      return nk;
    });
  }, [network]);

  const destroy = useCallback(() => {
    localStorage.removeItem(localStorageKeys.privateKey);
    localStorage.removeItem(localStorageKeys.lastUsedAddress);
    setAddress('');
    setKit(newKit(network.rpcUrl));
    setInitialised(false);
  }, [network]);

  const updateKit = useCallback((k: ContractKit) => {
    setKit(k);
    setInitialised(true);
  }, []);

  /**
   * Helper function for handling any interaction with a Celo wallet. Perform action will
   *    - open the action modal
   *    - handle multiple transactions in order
   */
  const performActions = useCallback(
    async (...operations: (() => any | Promise<any>)[]) => {
      if (!initialised) {
        setModalIsOpen(true);
        return;
      }

      setPendingActionCount(operations.length);

      const results = [];
      for (const op of operations) {
        try {
          results.push(await op());
        } catch (e) {
          setPendingActionCount(0);
          throw e;
        }

        setPendingActionCount((c) => c - 1);
      }

      return results;
    },
    [initialised]
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
        kit.contracts.getGasPriceMinimum(),
        kit.contracts.getGoldToken(),
        kit.contracts.getStableToken(),
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
    [kit, address, performActions]
  );

  return {
    network,
    updateNetwork,

    address,
    kit,
    destroy,

    pendingActionCount,

    send: sendTransaction,
    sendTransaction,
    performActions,

    updateKit,

    modalIsOpen,
    openModal: () => setModalIsOpen(true),
    closeModal: () => setModalIsOpen(false),
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
