import { Networks } from './types';
import { getFornoUrl, localStorageKeys } from './constants';
import { newKit, newKitFromWeb3 } from '@celo/contractkit';

export const fromPrivateKey = async (n: Networks, privateKey: string) => {
  const { LocalWallet } = await import('@celo/wallet-local');

  localStorage.setItem(localStorageKeys.privateKey, privateKey);
  const wallet = new LocalWallet();
  wallet.addAccount(privateKey);
  const k = newKit(getFornoUrl(n), wallet);
  k.defaultAccount = wallet.getAccounts()[0];

  return k;
};

export const fromLedger = async (n: Networks, index: number) => {
  const { default: TransportUSB } = await import(
    '@ledgerhq/hw-transport-webusb'
  );
  const { newLedgerWalletWithSetup } = await import('@celo/wallet-ledger');

  const transport = await TransportUSB.create();
  const wallet = await newLedgerWalletWithSetup(transport, [index ?? 0]);
  const k = newKit(getFornoUrl(n), wallet);
  k.defaultAccount = wallet.getAccounts()[0];

  return k;
};

export const fromDappKit = async (n: Networks, dappName: string) => {
  const { DappKitWallet } = await import('./dappkit-wallet');

  const wallet = new DappKitWallet(dappName);
  await wallet.init();

  // @ts-ignore
  const k = newKit(getFornoUrl(n), wallet);
  k.defaultAccount = wallet.getAccounts()[0];

  wallet.setKit(k);
  return k;
};

export const fromWalletConnect = async (
  n: Networks,
  w: any // WalletConnectWallet
) => {
  const [account] = w.getAccounts();
  const kit = newKit(getFornoUrl(n), w);
  kit.defaultAccount = account;
  return kit;
};

export const fromWeb3 = async (n: Networks, w: any) => {
  const { default: Web3 } = await import('web3');

  const [defaultAccount] = await w.eth.getAccounts();
  const kit = newKitFromWeb3(w);
  kit.defaultAccount = defaultAccount;

  return kit;
};
