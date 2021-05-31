interface Window {
  ethereum?: {
    on: (ev: 'chainChanged', cb: (chainId: number) => void) => void;
    on: (...args: any[]) => void;
    isMetaMask?: boolean;
    request: (args: { method: string; params: unknown[] }) => Promise<void>;
    enable: () => Promise<void>;
  };
  celo?: {
    on?: (...args: any[]) => void;
    removeListener?: (...args: any[]) => void;
    autoRefreshOnNetworkChange?: boolean;
    enable: () => Promise<void>;
  };
  web3?: unknown;
}
