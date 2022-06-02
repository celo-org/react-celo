import { localStorageKeys, WalletTypes } from '../constants';
import {
  forgetConnection,
  getLastUsedWalletArgs,
  getTypedStorageKey,
  setLastUsedWalletArgs,
  setTypedStorageKey,
  WalletArgs,
} from './localStorage';

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
  });
  describe('get/setLastUsedWalletArgs', () => {
    describe('', () => {
      it('accepts string', () => {
        const args = ['0x123456789'] as [string];
        setLastUsedWalletArgs(args);
        expect(getLastUsedWalletArgs()).toMatchObject(args);
      });
      it('accepts number', () => {
        const args = [1] as [1];
        setLastUsedWalletArgs(args);
        expect(getLastUsedWalletArgs()).toMatchObject(args);
      });
      it('accepts object arg', () => {
        const args = [
          {
            init: {
              bridge: 'bridge.react-celo.nom',
              uri: 'uri.react-celo.nom',
              storageId: '212',
              signingMethods: ['eth_sign'],
              session: {
                connected: false,
                accounts: ['0x0123123'],
                chainId: 1,
                bridge: 'bridge.react-celo.nom',
                key: 'key',
                clientId: '1123123',
                clientMeta: null,
                peerId: 'ksjhf1333',
                peerMeta: null,
                handshakeId: 99,
                handshakeTopic: 'opti8',
              },
            },
            connect: { chainId: 44 },
          },
        ];
        setLastUsedWalletArgs(args as WalletArgs);
        expect(getLastUsedWalletArgs()).toMatchObject(args);
      });
    });
  });

  describe(forgetConnection, () => {
    beforeEach(() => {
      setLastUsedWalletArgs([1]);
      setTypedStorageKey(localStorageKeys.lastUsedNetwork, 'Alfajores');
      setTypedStorageKey(
        localStorageKeys.lastUsedWalletType,
        WalletTypes.Injected
      );
    });
    it('resets last Network', () => {
      expect(getTypedStorageKey(localStorageKeys.lastUsedNetwork)).toEqual(
        'Alfajores'
      );
      forgetConnection();
      expect(getTypedStorageKey(localStorageKeys.lastUsedNetwork)).toEqual(
        null
      );
    });
    it('resets last used type', () => {
      expect(getTypedStorageKey(localStorageKeys.lastUsedWalletType)).toEqual(
        WalletTypes.Injected
      );
      forgetConnection();
      expect(getTypedStorageKey(localStorageKeys.lastUsedWalletType)).toEqual(
        null
      );
    });
    it('resets last used arguments', () => {
      expect(getLastUsedWalletArgs()).toEqual([1]);
      forgetConnection();
      expect(getLastUsedWalletArgs()).toBe(null);
    });
  });
});
