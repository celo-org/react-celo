import { ContractKit, newKit } from '@celo/contractkit';
import { CeloTransactionObject } from '@celo/connect';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import ReactModal from 'react-modal';
import { createContainer } from 'unstated-next';
import { getFornoUrl, localStorageKeys } from './constants';
import { fromPrivateKey } from './create-kit';
import { ActionModal, ActionModalProps, ConnectModal } from './modals';
import { Networks, Provider } from './types';

const lastUsedNetwork =
  (typeof localStorage !== 'undefined' &&
    (localStorage.getItem(localStorageKeys.lastUsedNetwork) as Networks)) ||
  Networks.Alfajores;
const lastUsedAddress =
  (typeof localStorage !== 'undefined' &&
    localStorage.getItem(localStorageKeys.lastUsedAddress)) ||
  '';

const savedPrivateKey =
  typeof localStorage !== 'undefined' &&
  localStorage.getItem(localStorageKeys.privateKey);
const initialKit = savedPrivateKey
  ? fromPrivateKey(lastUsedNetwork, savedPrivateKey)
  : newKit(getFornoUrl(lastUsedNetwork));

function Kit({ network: initialNetwork }: { network?: Networks } = {}) {
  const [address, setAddress] = useState(lastUsedAddress);
  const [initialised, setInitialised] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [network, updateNetwork] = useState(lastUsedNetwork || initialNetwork);
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
    if (localStorage.getItem(localStorageKeys.lastUsedNetwork) === network) {
      return;
    }

    localStorage.setItem(localStorageKeys.lastUsedNetwork, network);
    setKit((k) => {
      const existingWallet = k.getWallet();
      if (!existingWallet) {
        return newKit(getFornoUrl(network));
      }

      const nk = newKit(getFornoUrl(network), existingWallet);
      nk.defaultAccount = existingWallet.getAccounts()[0];
      return nk;
    });
  }, [network]);

  const destroy = useCallback(() => {
    localStorage.removeItem(localStorageKeys.privateKey);
    localStorage.removeItem(localStorageKeys.lastUsedAddress);
    setAddress('');
    setKit(newKit(getFornoUrl(network)));
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
      for (let i = 0; i < operations.length; i++) {
        try {
          results.push(await operations[i]);
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
      sendOpts?: any
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
        ? celo.address
        : cusdBalance.gt(0)
        ? cusd.address
        : undefined;

      const resolved = await tx;
      const txs = Array.isArray(resolved) ? resolved : [resolved];

      return performActions(
        ...txs.map((tx) => () =>
          tx.sendAndWaitForReceipt({
            from: address,
            gasPrice,
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
    fornoUrl: getFornoUrl(network),

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
  network,
}: {
  children: ReactNode;
  dappName: string;
  network?: Networks;

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
    <KitState.Provider initialState={{ network }}>
      <ConnectModal dappName={dappName} {...connectModal} />
      <ActionModal dappName={dappName} {...actionModal} />

      {children}
    </KitState.Provider>
  );
}
