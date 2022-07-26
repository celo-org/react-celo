import { CeloContract } from '@celo/contractkit';

import { UnauthenticatedConnector } from '../../src/connectors';
import { Alfajores, Baklava } from '../../src/constants';
import { celoReactReducer, ReducerState } from '../../src/react-celo-reducer';

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
});

describe('disconnect', () => {
  let newState: ReducerState;
  beforeEach(() => {
    newState = celoReactReducer(
      { ...initialState, address: '0x0123456789abcdf' },
      { type: 'disconnect', payload: undefined }
    );
  });
  it('removes the address from state', () => {
    expect(newState.address).toEqual(null);
  });

  it('removes the address from localStorage', () => {
    newState = celoReactReducer(
      { ...initialState, address: '0x0123456789abcdf' },
      { type: 'disconnect', payload: undefined }
    );

    expect(newState.address).toEqual(null);
  });
});

describe('connect', () => {
  it('sets the address and network', () => {
    const state = celoReactReducer(initialState, {
      type: 'connect',
      payload: { address: '0x1234567890', networkName: Baklava.name },
    });

    expect(state).toHaveProperty('address', '0x1234567890');
    expect(state).toHaveProperty('network', Baklava);
  });
});

describe('setNetworkByName', () => {
  it('sets the address and network', () => {
    const state = celoReactReducer(initialState, {
      type: 'setNetworkByName',
      payload: Baklava.name,
    });

    expect(state).toHaveProperty('network', Baklava);
  });
});
