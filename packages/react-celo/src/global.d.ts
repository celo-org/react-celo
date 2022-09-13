import QRCode from 'qrcode';
import { AbstractProvider } from 'web3-core';

declare global {
  interface Window {
    ethereum?: Ethereum;
    celo?: AbstractProvider & {
      on?: (...args: unknown[]) => void;
      removeListener?: (...args: unknown[]) => void;
      autoRefreshOnNetworkChange?: boolean;
      enable: () => Promise<void>;
      publicConfigStore: {
        on: (
          event: string,
          cb: (args: { networkVersion: number }) => void
        ) => void;
      };
    };
    web3?: unknown;
  }
}

interface Ethereum extends Exclude<AbstractProvider, 'request'> {
  _metamask: {
    isUnlocked: () => Promise<boolean>;
  };
  on: AddEthereumEventListener;
  removeListener: RemoveEthereumEventListener;
  isMetaMask?: boolean;
  isConnected: () => boolean;
  selectedAddress: string | undefined;
  request: EthereumRequest;
  enable: () => Promise<void>;
  chainId?: string;
}

type AddEthereumEventListener = <Event extends keyof EthereumEventCallbacks>(
  event: Event,
  cb: EthereumEventCallbacks[Event]
) => void;

type RemoveEthereumEventListener = <Event extends keyof EthereumEventCallbacks>(
  event: Event,
  cb?: EthereumEventCallbacks[Event]
) => void;

interface EthereumEventCallbacks {
  chainChanged: (chainIdHex: string) => void;
  accountsChanged: (accounts: string[]) => void;
}

type EthereumRequest = <Method extends keyof EthereumRequestReturns>(args: {
  method: Method;
  params?: unknown[] | unknown;
}) => Promise<EthereumRequestReturns[Method]>;

interface EthereumRequestReturns {
  eth_requestAccounts: string[];
  wallet_addEthereumChain: null;
  wallet_watchAsset: boolean;
  wallet_switchEthereumChain: null;
  eth_chainId: string;
}

interface BitMatrix {
  size: number;
  reservedBits: Uint8Array;
  data: Uint8Array;
}

interface QRCodeClass extends QRCode.QRCode {
  modules: BitMatrix;
}

interface BitMatrix {
  size: number;
  reservedBits: Uint8Array;
  data: Uint8Array;
}

interface QRCodeClass extends QRCode.QRCode {
  modules: BitMatrix;
}
