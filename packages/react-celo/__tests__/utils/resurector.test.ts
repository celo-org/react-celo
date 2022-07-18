import crypto from 'crypto';

import { CONNECTOR_TYPES } from '../../src/connectors/connectors-by-name';
import {
  Baklava,
  DEFAULT_NETWORKS,
  localStorageKeys,
  NetworkNames,
  WalletTypes,
} from '../../src/constants';
import { Dapp } from '../../src/types';
import {
  clearPreviousConfig,
  setTypedStorageKey,
} from '../../src/utils/local-storage';
import { resurrector } from '../../src/utils/resurrector';

const PRIVATE_TEST_KEY =
  '04f9d516be49bb44346ca040bdd2736d486bca868693c74d51d274ad92f61976';

const dapp: Dapp = {
  name: 'Rise Wallet',
  description: 'Ascend',
  url: 'example.com',
  icon: '',
};

describe('resurrector', () => {
  beforeAll(() => {
    // @ts-expect-error global override
    global.crypto = crypto;
    Object.defineProperty(global.self, 'crypto', {
      value: {
        getRandomValues: (arr: number[]) => crypto.randomBytes(arr.length),
      },
    });
  });
  afterEach(() => {
    clearPreviousConfig();
  });

  describe('when no walletType in Local Storage', () => {
    it('returns null', () => {
      expect(resurrector(DEFAULT_NETWORKS, dapp)).toEqual(null);
    });
  });
  Object.keys(WalletTypes)
    .filter((wt) => wt !== WalletTypes.Unauthenticated)
    .forEach((wt) => {
      describe(`when LocalStorage has ${localStorageKeys.lastUsedWalletType} of ${wt}`, () => {
        beforeEach(() => {
          setTypedStorageKey(
            localStorageKeys.lastUsedNetwork,
            NetworkNames.Alfajores
          );
          setTypedStorageKey(
            localStorageKeys.lastUsedWalletType,
            wt as WalletTypes
          );
          setTypedStorageKey(
            localStorageKeys.lastUsedPrivateKey,
            PRIVATE_TEST_KEY
          );
          setTypedStorageKey(localStorageKeys.lastUsedIndex, 1);
        });
        it('creates the Connector for that type', () => {
          const resurrected = resurrector(DEFAULT_NETWORKS, dapp);
          expect(resurrected).toBeInstanceOf(
            CONNECTOR_TYPES[wt as WalletTypes]
          );
        });

        describe('when network in local Storage cant be found', () => {
          it('does not resurrect', () => {
            expect(resurrector([Baklava], dapp)).toBe(null);
          });
        });
      });
    });
});
