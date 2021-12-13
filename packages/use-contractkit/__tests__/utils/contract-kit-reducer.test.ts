import { CeloContract } from '@celo/contractkit';

import { UnauthenticatedConnector } from '../../src/connectors';
import { Alfajores, Baklava } from '../../src/constants';
import {
  contractKitReducer,
  ReducerState,
} from '../../src/contract-kit-reducer';

const initialState: ReducerState = {
  connector: new UnauthenticatedConnector(Alfajores),
  connectorInitError: null,
  dapp: {
    name: 'use-contractkit demo',
    description: 'A demo DApp to showcase functionality',
    url: 'https://use-contractkit.vercel.app',
    icon: 'https://use-contractkit.vercel.app/favicon.ico',
  },
  network: Alfajores,
  networks: [Alfajores, Baklava],
  pendingActionCount: 0,
  address: null,
  feeCurrency: CeloContract.GoldToken,
  connectionCallback: null,
};

describe('reducer', () => {
  it('works', () => {
    const newState = contractKitReducer(initialState, {
      type: 'setAddress',
      payload: 'test-address',
    });

    expect(newState).toEqual({ ...initialState, address: 'test-address' });
  });
});
