import { CeloTokenContract } from '@celo/contractkit';

import { UnauthenticatedConnector } from './connectors';
import { localStorageKeys } from './constants';
import { Connector, Dapp, Network } from './types';
import { clearPreviousConfig } from './utils/helpers';
import localStorage from './utils/localStorage';

export function contractKitReducer(
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
        localStorage.setItem(localStorageKeys.lastUsedAddress, action.payload);
      } else {
        localStorage.removeItem(localStorageKeys.lastUsedAddress);
      }
      return {
        ...state,
        address: action.payload,
      };
    case 'setNetwork':
      if (action.payload === state.network) {
        return state;
      }
      localStorage.setItem(
        localStorageKeys.lastUsedNetwork,
        action.payload.name
      );
      return {
        ...state,
        network: action.payload,
      };

    case 'setConnector':
      localStorage.removeItem(localStorageKeys.lastUsedAddress);
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
      localStorage.setItem(
        localStorageKeys.lastUsedFeeCurrency,
        action.payload
      );
      return { ...state, feeCurrency: action.payload };
    case 'initialisedConnector': {
      const newConnector = action.payload;
      const address = newConnector.kit.defaultAccount ?? null;
      if (address) {
        localStorage.setItem(localStorageKeys.lastUsedAddress, address);
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
        console.error(
          new Error(
            `Unrecognized action type ${action.type} in contractKitReducer`
          )
        );
      }
      return state;
  }
}

export interface ReducerState {
  connector: Connector;
  connectorInitError: Error | null;
  dapp: Dapp;
  network: Network;
  networks: Network[];
  pendingActionCount: number;
  address: string | null;
  feeCurrency: CeloTokenContract;

  connectionCallback: ((connector: Connector | false) => void) | null;
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
