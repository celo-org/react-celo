import '@testing-library/jest-dom';

import { renderHook } from '@testing-library/react';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { Mainnet } from '../src/constants';

import {
  ContractKitProvider,
  ContractKitProviderProps,
} from '../src/contract-kit-provider';
import { Network } from '../src/types';
import { UseContractKit, useContractKit } from '../src/use-contractkit';

interface RenderArgs {
  providerProps: Partial<ContractKitProviderProps>;
}

const defaultProps: ContractKitProviderProps = {
  dapp: {
    name: 'Testing Celo React',
    description: 'Test it well',
    url: 'https://celo.developers',
    icon: '',
  },
  children: null,
};

function customRender<R>(
  hook: (i: unknown) => R,
  { providerProps }: RenderArgs
) {
  return renderHook<R, unknown>(hook, {
    wrapper: ({ children }) => {
      const props = { ...defaultProps, ...providerProps };
      return <ContractKitProvider {...props}>{children}</ContractKitProvider>;
    },
  });
}

describe('ContractKitProvider', () => {
  describe('with networks', () => {
    const networks: Network[] = [
      {
        name: 'SecureFastChain',
        rpcUrl: 'https://rpc-mainnet.matic.network',
        explorer: 'https://explorer.example.com',
        chainId: 9812374,
        nativeCurrency: {
          name: 'SFC',
          symbol: 'SFC',
          decimals: 18,
        },
      },
      {
        name: 'BoringChain',
        rpcUrl: 'https://bsc-dataseed.binance.org/',
        explorer: 'https://explorer.boringchain.org',
        chainId: 0x38,
        nativeCurrency: {
          name: 'BORING',
          symbol: 'BOR',
          decimals: 18,
        },
      },
    ];

    const renderUseCK = (props: Partial<ContractKitProviderProps>) =>
      customRender<UseContractKit>(useContractKit, {
        providerProps: props,
      });

    it('defaults to Celo Mainnet', () => {
      const hookReturn = renderUseCK({});
      expect(hookReturn.result.current.network).toEqual(Mainnet);
    });

    it('supports passing other networks', () => {
      const hookReturn = renderUseCK({ networks, network: networks[0] });
      expect(hookReturn.result.current.networks).toEqual(networks);

      expect(hookReturn.result.current.network).toEqual(networks[0]);
    });

    it('updates the Current network', async () => {
      const { result, rerender } = renderUseCK({ networks });

      // FIXME Need to determine behavior when network is not in networks
      expect(result.current.network).toEqual(Mainnet);

      await act(async () => {
        await result.current.updateNetwork(networks[1]);
      });

      rerender();

      expect(result.current.network).toEqual(networks[1]);
    });
  });
});
