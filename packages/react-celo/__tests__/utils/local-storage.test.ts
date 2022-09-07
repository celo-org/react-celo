import { CeloContract } from '@celo/contractkit';

import { localStorageKeys, WalletIds, WalletTypes } from '../../src/constants';
import {
  getRecentWallets,
  getTypedStorageKey,
  rememberWallet,
  setTypedStorageKey,
  wipeStorage,
} from '../../src/utils/local-storage';

describe('TypedLocalStorage', () => {
  beforeEach(() => {
    wipeStorage();
  });
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

describe('getRecentWallets', () => {
  beforeEach(() => {
    wipeStorage();
  });
  it('returns an empty array when nothing is there', () => {
    expect(getRecentWallets()).toEqual([]);
  });
  it('returns array of {type} strings when they have been added', () => {
    setTypedStorageKey(
      localStorageKeys.lastUsedWallets,
      JSON.stringify([`${WalletTypes.MetaMask}`])
    );
    expect(getRecentWallets()).toEqual([WalletTypes.MetaMask]);
  });
});

describe('rememberWallet', () => {
  beforeEach(() => {
    wipeStorage();
  });
  describe('when storing for first time', () => {
    it('saves it', () => {
      rememberWallet(WalletTypes.Valora, WalletIds.Valora);
      expect(getRecentWallets()).toEqual([
        `${WalletTypes.Valora}:${WalletIds.Valora}`,
      ]);
    });
  });
  describe('when storing A BA C', () => {
    it('will be storing B A C', () => {
      rememberWallet(WalletTypes.Valora, WalletIds.Valora);
      rememberWallet(WalletTypes.MetaMask);
      rememberWallet(WalletTypes.Valora, WalletIds.Valora);
      rememberWallet(WalletTypes.CeloTerminal, WalletIds.CeloTerminal);
      expect(getRecentWallets()).toEqual([
        `${WalletTypes.CeloTerminal}:${WalletIds.CeloTerminal}`,
        `${WalletTypes.Valora}:${WalletIds.Valora}`,
        WalletTypes.MetaMask,
      ]);
    });
  });
  describe('when at max size', () => {
    it('adds it and removes last item', () => {
      rememberWallet(WalletTypes.Valora, WalletIds.Valora);
      rememberWallet(WalletTypes.MetaMask);
      rememberWallet(WalletTypes.WalletConnect, WalletIds.Omni);
      rememberWallet(WalletTypes.CeloTerminal, WalletIds.CeloTerminal);

      expect(getRecentWallets()).toEqual([
        `${WalletTypes.CeloTerminal}:${WalletIds.CeloTerminal}`,
        `${WalletTypes.WalletConnect}:${WalletIds.Omni}`,
        WalletTypes.MetaMask,
      ]);
    });
  });
});
