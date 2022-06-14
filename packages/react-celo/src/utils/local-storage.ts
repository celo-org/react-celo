import { CeloTokenContract } from '@celo/contractkit';
import { WalletConnectWalletOptions } from '@celo/wallet-walletconnect-v1';

import { localStorageKeys, WalletTypes } from '../constants';

class MockedLocalStorage implements Storage {
  private storage = new Map<string, string>();

  getItem(key: string): string | null {
    if (this.storage.has(key)) {
      this.storage.get(key) as string;
    }
    return null;
  }

  key(index: number): string | null {
    if (index < 0 || index >= this.length) {
      return null;
    }

    let i = 0;
    for (const value of this.storage.values()) {
      if (i === index) {
        return value;
      }
      i += 1;
    }
    return null;
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }

  get length(): number {
    return this.storage.size;
  }
}

const localStorage =
  typeof window === 'undefined'
    ? new MockedLocalStorage()
    : window.localStorage;

type ParamType = {
  [localStorageKeys.lastUsedAddress]: string;
  [localStorageKeys.lastUsedNetwork]: string;
  [localStorageKeys.lastUsedPrivateKey]: string;
  [localStorageKeys.lastUsedWalletId]: string;
  [localStorageKeys.lastUsedFeeCurrency]: CeloTokenContract;
  [localStorageKeys.lastUsedIndex]: number;
  [localStorageKeys.lastUsedWalletType]: WalletTypes;
  [localStorageKeys.lastUsedWalletArguments]: [];
};

export function getTypedStorageKey<T extends localStorageKeys>(key: T) {
  const item = localStorage.getItem(key);
  if (key === localStorageKeys.lastUsedIndex && item) {
    return Number(item) as ParamType[T];
  }
  if (item) {
    return item as ParamType[T];
  }
  return null;
}

export function setTypedStorageKey<
  T extends localStorageKeys,
  V extends ParamType[T]
>(key: T, value: V): void {
  localStorage.setItem(key, value.toString());
}

export function removeLastUsedAddress() {
  localStorage.removeItem(localStorageKeys.lastUsedAddress);
}

export type WalletArgs =
  | [string]
  | [CeloTokenContract]
  | [WalletConnectWalletOptions]
  | [number]
  | [];

export function getLastUsedWalletArgs(): WalletArgs | null {
  const args = localStorage.getItem(localStorageKeys.lastUsedWalletArguments);
  if (args && args.length) {
    const parsed = JSON.parse(args) as WalletArgs;

    return parsed;
  }

  return null;
}

export function setLastUsedWalletArgs(params: WalletArgs) {
  const args = JSON.stringify(params);
  localStorage.setItem(localStorageKeys.lastUsedWalletArguments, args);
}

export function forgetConnection() {
  [
    localStorageKeys.lastUsedWalletType,
    localStorageKeys.lastUsedWalletArguments,
    localStorageKeys.lastUsedNetwork,
  ].forEach((key) => localStorage.removeItem(key));
}

export function clearPreviousConfig(): void {
  Object.values(localStorageKeys).forEach((val) => {
    if (val === localStorageKeys.lastUsedWalletId) return;
    if (val === localStorageKeys.lastUsedWalletType) return;
    localStorage.removeItem(val);
  });
}

export function localStorageAvailable() {
  return typeof localStorage !== 'undefined';
}
