import { CONNECTOR_TYPES } from '../../src/connectors';
import {
  Baklava,
  DEFAULT_NETWORKS,
  localStorageKeys,
  NetworkNames,
  WalletTypes,
} from '../../src/constants';
import {
  clearPreviousConfig,
  setTypedStorageKey,
} from '../../src/utils/local-storage';
import { resurrector } from '../../src/utils/resurrector';

const PRIVATE_TEST_KEY =
  '04f9d516be49bb44346ca040bdd2736d486bca868693c74d51d274ad92f61976';

describe('resurrector', () => {
  afterEach(() => {
    clearPreviousConfig();
  });

  describe('when no walletType in Local Storage', () => {
    it('returns null', () => {
      expect(resurrector(DEFAULT_NETWORKS)).toEqual(null);
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
          const resurrected = resurrector(DEFAULT_NETWORKS);
          expect(resurrected).toBeInstanceOf(
            CONNECTOR_TYPES[wt as WalletTypes]
          );
        });

        describe('when network in local Storage cant be found', () => {
          it('does not resurrect', () => {
            expect(resurrector([Baklava])).toBe(null);
          });
        });
      });
    });
});
