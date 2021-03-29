import { Network } from './types';
import { localStorageKeys } from './constants';
import { newKit, newKitFromWeb3 } from '@celo/contractkit';
import { LocalWallet } from '@celo/wallet-local';
// we can't lazy load this due to the new tab bug, it must be imported
// so that the new tab handler fires.
import { DappKitWallet } from './dappkit-wallet';

export const fromPrivateKey = (n: Network, privateKey: string) => {
  localStorage.setItem(localStorageKeys.privateKey, privateKey);
  const wallet = new LocalWallet();
  wallet.addAccount(privateKey);
  const k = newKit(n.rpcUrl, wallet);
  k.defaultAccount = wallet.getAccounts()[0];
  return k;
};

export const fromLedger = async (n: Network, index: number) => {
  const { default: TransportUSB } = await import(
    '@ledgerhq/hw-transport-webusb'
  );
  const { newLedgerWalletWithSetup } = await import('@celo/wallet-ledger');

  const transport = await TransportUSB.create();
  const wallet = await newLedgerWalletWithSetup(transport, [index ?? 0]);
  const k = newKit(n.rpcUrl, wallet);
  k.defaultAccount = wallet.getAccounts()[0];

  return k;
};

export const fromDappKit = async (n: Network, dappName: string) => {
  const wallet = new DappKitWallet(dappName);
  await wallet.init();

  // @ts-ignore
  const k = newKit(getFornoUrl(n), wallet);
  k.defaultAccount = wallet.getAccounts()[0];

  wallet.setKit(k);
  return k;
};

export const fromWalletConnect = async (
  n: Network,
  w: any // WalletConnectWallet
) => {
  const [account] = w.getAccounts();
  const kit = newKit(n.rpcUrl, w);
  kit.defaultAccount = account;
  return kit;
};

export const fromWeb3 = async (n: Network, w: any) => {
  const [defaultAccount] = await w.eth.getAccounts();
  const kit = newKitFromWeb3(w);
  kit.defaultAccount = defaultAccount;

  return kit;
};
