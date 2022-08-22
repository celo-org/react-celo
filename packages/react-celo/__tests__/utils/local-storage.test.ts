import { CeloContract } from '@celo/contractkit';

import { localStorageKeys, WalletTypes } from '../../src/constants';
import {
  getTypedStorageKey,
  setTypedStorageKey,
} from '../../src/utils/local-storage';

describe('TypedLocalStorage', () => {
  describe('get/setTypedStorageKey', () => {
    describe(localStorageKeys.lastUsedAddress, () => {
      it('sets Address', () => {
        setTypedStorageKey(localStorageKeys.lastUsedAddress, 'address');
        expect(getTypedStorageKey(localStorageKeys.lastUsedAddress)).toEqual(
          'address'
        );
      });
    });
    describe(localStorageKeys.lastUsedWalletType, () => {
      it('sets Last used Wallet', () => {
        setTypedStorageKey(
          localStorageKeys.lastUsedWalletType,
          WalletTypes.MetaMask
        );
        expect(getTypedStorageKey(localStorageKeys.lastUsedWalletType)).toEqual(
          WalletTypes.MetaMask
        );
      });
    });
    describe(localStorageKeys.lastUsedFeeCurrency, () => {
      it('sets Last used Wallet', () => {
        setTypedStorageKey(
          localStorageKeys.lastUsedFeeCurrency,
          CeloContract.StableTokenBRL
        );
        expect(
          getTypedStorageKey(localStorageKeys.lastUsedFeeCurrency)
        ).toEqual(CeloContract.StableTokenBRL);
      });
    });
  });
});
