import { CeloContract } from '@celo/contractkit';

import { localStorageKeys } from '../../src';
import { UnauthenticatedConnector } from '../../src/connectors';
import { Alfajores, Baklava } from '../../src/constants';
import { celoReactReducer, ReducerState } from '../../src/react-celo-reducer';
import { getTypedStorageKey } from '../../src/utils/localStorage';

const initialState: ReducerState = {
  connector: new UnauthenticatedConnector(Alfajores),
  connectorInitError: null,
  dapp: {
    name: 'react-celo demo',
    description: 'A demo DApp to showcase functionality',
    url: 'https://react-celo.vercel.app',
    icon: 'https://react-celo.vercel.app/favicon.ico',
  },
  network: Alfajores,
  networks: [Alfajores, Baklava],
  pendingActionCount: 0,
  address: null,
  feeCurrency: CeloContract.GoldToken,
  connectionCallback: null,
  theme: null,
};

describe('setAddress', () => {
  let newState: ReducerState;
  beforeEach(() => {
    newState = celoReactReducer(initialState, {
      type: 'setAddress',
      payload: 'test-address',
    });
  });
  it('adds new address', () => {
    expect(newState).toEqual({ ...initialState, address: 'test-address' });
  });
  it('saves the address in localStorage', () => {
    expect(getTypedStorageKey(localStorageKeys.lastUsedAddress)).toEqual(
      'test-address'
    );
  });
});

describe('destroy', () => {
  let newState: ReducerState;
  beforeEach(() => {
    newState = celoReactReducer(
      { ...initialState, address: '0x0123456789abcdf' },
      { type: 'destroy', payload: undefined }
    );
  });
  it('removes the address from state', () => {
    expect(newState.address).toEqual(null);
  });

  it('removes the address from localStorage', () => {
    newState = celoReactReducer(
      { ...initialState, address: '0x0123456789abcdf' },
      { type: 'destroy', payload: undefined }
    );

    expect(newState.address).toEqual(null);
  });
});
