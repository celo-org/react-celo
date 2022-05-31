import { localStorageKeys } from '../constants';

export function clearPreviousConfig(): void {
  Object.values(localStorageKeys).forEach((val) => {
    if (val === localStorageKeys.lastUsedWalletId) return;
    if (val === localStorageKeys.lastUsedWalletType) return;
    localStorage.removeItem(val);
  });
}
