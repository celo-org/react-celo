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

describe('reducer', () => {
  it('works', () => {
    const newState = celoReactReducer(initialState, {
      type: 'setAddress',
      payload: 'test-address',
    });

    expect(newState).toEqual({ ...initialState, address: 'test-address' });
  });
});
