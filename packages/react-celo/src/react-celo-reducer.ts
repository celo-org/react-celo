import { CeloTokenContract } from '@celo/contractkit/lib/base';

import { UnauthenticatedConnector } from './connectors';
import { localStorageKeys as lsKeys } from './constants';
import { Connector, Dapp, Maybe, Network, Theme } from './types';
import {
  clearPreviousConfig,
  removeLastUsedAddress,
  setTypedStorageKey,
} from './utils/local-storage';
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
      if (action.payload) {
        setTypedStorageKey(lsKeys.lastUsedAddress, action.payload);
      } else {
        removeLastUsedAddress();
      }
      return {
        ...state,
        address: action.payload,
      };
    case 'setNetwork':
      if (action.payload === state.network) {
        return state;
      }
      setTypedStorageKey(lsKeys.lastUsedNetwork, action.payload.name);
      return {
        ...state,
        network: action.payload,
      };

    case 'setConnector':
      removeLastUsedAddress();
      return {
        ...state,
        connector: action.payload,
        connectorInitError: null,
        address: null,
      };
    case 'setFeeCurrency':
      if (action.payload === state.feeCurrency) {
        return state;
      }
      setTypedStorageKey(lsKeys.lastUsedFeeCurrency, action.payload);
      return { ...state, feeCurrency: action.payload };
    case 'initialisedConnector': {
      const newConnector = action.payload;
      const address = newConnector.kit.connection.defaultAccount ?? null;
      if (address) {
        setTypedStorageKey(lsKeys.lastUsedAddress, address);
      }
      return {
        ...state,
        connector: action.payload,
        address,
      };
    }

    case 'destroy':
      clearPreviousConfig();
      return {
        ...state,
        address: null,
        connector: new UnauthenticatedConnector(state.network),
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
  network: Network;
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
  destroy: undefined;
}

// This converts the `ActionsMap` into a union of possible actions
export type Actions = {
  [Key in keyof ActionsMap]: {
    type: Key;
    payload: ActionsMap[Key];
  };
}[keyof ActionsMap];
