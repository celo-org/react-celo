import { CeloTokenContract } from '@celo/contractkit/lib/base';

import { Connector, Dapp, Maybe, Network, Theme } from './types';
import { getApplicationLogger } from './utils/logger';

export function celoReactReducer(
  state: ReducerState,
  action: Actions
): ReducerState {
  switch (action.type) {
    case 'decrementPendingActionCount':
      return {
        ...state,
        pendingActionCount: state.pendingActionCount - 1,
      };

    case 'setAddress':
      if (action.payload === state.address) {
        return state;
      }
      return {
        ...state,
        address: action.payload,
      };
    case 'setWalletChainId':
      return { ...state, walletChainId: action.payload };
    case 'setNetwork':
      if (action.payload === state.network) {
        return state;
      }
      return {
        ...state,
        network: action.payload,
      };
    case 'setNetworkByName': {
      const network = state.networks.find((net) => net.name === action.payload);
      if (network) {
        return { ...state, network };
      }
      return state;
    }
    case 'setFeeCurrency':
      if (action.payload === state.feeCurrency) {
        return state;
      }
      return { ...state, feeCurrency: action.payload };
    case 'initialisedConnector': {
      return {
        ...state,
        connector: action.payload,
      };
    }
    case 'connect': {
      const network = state.networks.find(
        (net) => net.name === action.payload.networkName
      );
      return {
        ...state,
        address: action.payload.address,
        network: network!,
        walletChainId: action.payload.walletChainId,
      };
    }
    case 'disconnect':
      return {
        ...state,
        address: null,
        // connector is overwritten by the disconnect method init of a new Unauthenticated Connector, so no need to do here
      };

    default:
      // This checks to see if the action type is `set<fieldname>`
      if (action.type.slice(0, 3) === 'set') {
        // This builds the proper camel-case field name from the action type
        // e.g., setFieldName -> fieldName
        const key = `${action.type.charAt(3).toLowerCase()}${action.type.slice(
          4
        )}` as keyof ReducerState;
        return {
          ...state,
          [key]: action.payload,
        };
      } else {
        getApplicationLogger().error(
          '[reducer]',
          new Error(`Unrecognized action type ${action.type}`)
        );
      }
      return state;
  }
}

export interface ReducerState {
  connector: Connector;
  /**
   * Initialisation error, if applicable.
   */
  connectorInitError: Maybe<Error>;
  dapp: Dapp;
  /**
   * the chain id of the wallet (if applicable), may be different than dapp at certain moments,
   * exposed here to give developer optionality in handling network behavior
   * null when not known or wallet doesn't have a network (like ledger)
   */
  walletChainId: number | null;
  network: Network;
  manualNetworkMode: boolean;
  networks: Network[];
  pendingActionCount: number;
  address: Maybe<string>;
  feeCurrency: CeloTokenContract;
  theme: Maybe<Theme>;
  connectionCallback: Maybe<(connector: Connector | false) => void>;
}

// This creates `set<field>` actions out of the possible fields in ReducerState
type SetActions = {
  [Key in keyof ReducerState as `set${Capitalize<Key>}`]: ReducerState[Key];
};

// These are the non-`set<field>` actions
export interface ActionsMap extends SetActions {
  decrementPendingActionCount: undefined;
  initialisedConnector: Connector;
  disconnect: undefined;
  connect: {
    address: string;
    networkName: string;
    walletChainId: number | null;
  };
  setNetworkByName: string;
}

// This converts the `ActionsMap` into a union of possible actions
export type Actions = {
  [Key in keyof ActionsMap]: {
    type: Key;
    payload: ActionsMap[Key];
  };
}[keyof ActionsMap];
