import { newLedgerWalletWithSetup } from '@celo/wallet-ledger';
import { DappKitWallet } from './dappkit-wallet';
import { Networks } from './types';
import TransportUSB from '@ledgerhq/hw-transport-webusb';
import { getFornoUrl, localStorageKeys } from './constants';
import { LocalWallet } from '@celo/wallet-local';
import { newKit, newKitFromWeb3 } from '@celo/contractkit';
import { MetamaskWallet } from './metamask-wallet';
import Web3 from 'web3';

export const fromPrivateKey = (n: Networks, privateKey: string) => {
  localStorage.setItem(localStorageKeys.privateKey, privateKey);
  const wallet = new LocalWallet();
  wallet.addAccount(privateKey);
  const k = newKit(getFornoUrl(n), wallet);
  k.defaultAccount = wallet.getAccounts()[0];
  return k;
};

export const fromLedger = async (n: Networks) => {
  const transport = await TransportUSB.create();
  const wallet = await newLedgerWalletWithSetup(transport);

  const k = newKit(getFornoUrl(n), wallet);
  k.defaultAccount = wallet.getAccounts()[0];

  return k;
};

export const fromDappKit = async (n: Networks, dappName: string) => {
  const wallet = new DappKitWallet(dappName);
  await wallet.init();

  // @ts-ignore
  const k = newKit(getFornoUrl(n), wallet);
  k.defaultAccount = wallet.getAccounts()[0];

  // @ts-ignore
  k.connection.sendTransaction = (tx) => {
    console.log('send transaction', tx);
  };

  // @ts-ignore
  k.connection.sendSignedTransaction = (s) => {
    console.log('sendSignedTransaction', s);
  };

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

export const fromWeb3 = async (n: Networks, w: Web3) => {
  const [defaultAccount] = await w.eth.getAccounts();
  // @ts-ignore
  const kit = newKitFromWeb3(w);
  kit.defaultAccount = defaultAccount;
  return kit;
};
