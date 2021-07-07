import { AbstractProvider } from 'web3-core';

declare global {
  interface Window {
    ethereum?: AbstractProvider & {
      on: (ev: 'chainChanged', cb: (chainIdHex: string) => void) => void;
      isMetaMask?: boolean;
      request: (args: { method: string; params: unknown[] }) => Promise<void>;
      enable: () => Promise<void>;
    };
    celo?: AbstractProvider & {
      on?: (...args: unknown[]) => void;
      removeListener?: (...args: unknown[]) => void;
      autoRefreshOnNetworkChange?: boolean;
      enable: () => Promise<void>;
    };
    web3?: unknown;
  }
}
