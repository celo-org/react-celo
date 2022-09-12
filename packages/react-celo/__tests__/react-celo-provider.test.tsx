import '@testing-library/jest-dom';

import { CeloContract } from '@celo/contractkit';
import { act, fireEvent } from '@testing-library/react';
import React from 'react';

import {
  Alfajores,
  Baklava,
  Mainnet,
  NetworkNames,
  SupportedProviders,
} from '../src/constants';
import CeloProviderProps from '../src/react-celo-provider-props';
import defaultTheme from '../src/theme/default';
import { Network } from '../src/types';
import { UseCelo, useCelo, useCeloInternal } from '../src/use-celo';
import { clearPreviousConfig } from '../src/utils/local-storage';
import {
  renderComponentInCKProvider,
  renderHookInCKProvider,
} from './render-in-provider';

describe('CeloProvider', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(jest.fn());
    jest.spyOn(console, 'warn').mockImplementation(jest.fn());
    jest.spyOn(console, 'error').mockImplementation(jest.fn());
  });
  describe('user interface', () => {
    const ConnectButton = () => {
      const { connect } = useCelo();
      return <button onClick={connect}>Connect</button>;
    };

    async function stepsToOpenModal(props: Partial<CeloProviderProps> = {}) {
      const dom = renderComponentInCKProvider(<ConnectButton />, {
        providerProps: props,
      });

      const button = await dom.findByText('Connect');
      act(() => {
        fireEvent.click(button);
      });

      return dom;
    }

    describe('when Button with connect is Pressed', () => {
      it('opens wallets modal', async () => {
        const dom = await stepsToOpenModal();

        const modal = await dom.findByText('Connect a wallet');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        expect(modal).toBeVisible();
        dom.unmount();
      });
      it('shows default wallets', async () => {
        const dom = await stepsToOpenModal();

        const testPromises = Object.keys(SupportedProviders).map(
          async (key) => {
            const walletName = { ...SupportedProviders }[
              key
            ] as SupportedProviders;

            if (walletName === SupportedProviders.Injected) {
              return;
            }

            const walletEntry = await dom.findByText(walletName);

            expect(walletEntry).toBeVisible();
          }
        );

        await Promise.all(testPromises);
        dom.unmount();
      });
    });

    describe('when hideFromModal option is given array', () => {
      it('does not show those wallets in the UI', async () => {
        const dom = await stepsToOpenModal({
          connectModal: {
            providersOptions: {
              hideFromDefaults: [
                SupportedProviders.CeloDance,
                SupportedProviders.Ledger,
              ],
            },
          },
        });
        const valora = dom.queryByText('Valora');
        const ledger = dom.queryByText(SupportedProviders.Ledger);
        expect(valora).toBeVisible();

        expect(ledger).toBe(null);
        dom.unmount();
      });
    });
    describe('when hideFromModal option is given true', () => {
      it('does not show any wallets in the UI', async () => {
        const dom = await stepsToOpenModal({
          connectModal: {
            providersOptions: {
              hideFromDefaults: true,
            },
          },
        });
        const valora = dom.queryByText('Valora');
        const ledger = dom.queryByText(SupportedProviders.Ledger);
        const none = dom.queryByText('No matches');
        expect(valora).toBe(null);

        expect(ledger).toBe(null);

        expect(none).toBeVisible();
        dom.unmount();
      });
    });
  });

  describe('hook interface', () => {
    const renderUseCelo = (props: Partial<CeloProviderProps>) =>
      renderHookInCKProvider<UseCelo>(useCelo, {
        providerProps: props,
      });

    const renderUseCeloInternal = (props: Partial<CeloProviderProps>) =>
      renderHookInCKProvider<ReturnType<typeof useCeloInternal>>(
        useCeloInternal,
        {
          providerProps: props,
        }
      );

    describe('regarding networks', () => {
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

      it('defaults to Celo Mainnet', () => {
        const hookReturn = renderUseCelo({});
        expect(hookReturn.result.current.network).toEqual(Mainnet);
        hookReturn.unmount();
      });

      it('supports passing other networks', () => {
        const hookReturn = renderUseCelo({ networks, network: networks[0] });
        expect(hookReturn.result.current.networks).toEqual(networks);

        expect(hookReturn.result.current.network).toEqual(networks[0]);
        hookReturn.unmount();
      });

      it('updates the Current network', async () => {
        const { result, rerender, unmount } = renderUseCelo({
          networks,
          defaultNetwork: networks[0].name,
        });

        expect(result.current.network).toEqual(networks[0]);

        await act(async () => {
          await result.current.updateNetwork(networks[1]);
        });
        rerender();

        expect(result.current.network).toEqual(networks[1]);
        unmount();
      });

      describe('updateNetwork with dappOnly True', () => {
        it('sets network in the state/connector', async () => {
          const { result, rerender, unmount } = renderUseCelo({
            networks,
            defaultNetwork: networks[0].name,
          });

          expect(result.current.network).toEqual(networks[0]);

          await act(async () => {
            await result.current.updateNetwork(networks[1], true);
          });

          rerender();

          expect(result.current.network).toEqual(networks[1]);
          unmount();
        });
      });

      it('still allows old network prop to be used ', () => {
        const { result } = renderUseCelo({
          network: Baklava,
        });

        expect(result.current.network).toEqual(Baklava);
      });

      describe('when given defaultNetwork prop that exists in networks', () => {
        it('starts with that network', () => {
          const { result } = renderUseCelo({
            defaultNetwork: NetworkNames.Alfajores,
          });

          expect(result.current.network).toMatchObject(Alfajores);
        });
      });
      describe('when given defaultNetwork prop does not exist in networks', () => {
        it('throws an error', () => {
          expect(() => {
            renderUseCelo({
              defaultNetwork: 'Solana',
            });
          }).toThrowError(
            `[react-celo] Could not find 'defaultNetwork' (Solana) in 'networks'. 'defaultNetwork' must equal 'network.name' on one of the 'networks' passed to CeloProvider.`
          );
        });
      });
      describe('when given defaultNetwork and networks array prop', () => {
        it('starts with the network it found', () => {
          const customRPCMainnet: Network = {
            name: NetworkNames.Mainnet,
            chainId: Mainnet.chainId,
            rpcUrl: 'https://rpc.ankr.com/celo',
            explorer: 'https://celoscan.xyz',
          };
          const { result } = renderUseCelo({
            defaultNetwork: NetworkNames.Mainnet,
            networks: [Alfajores, Baklava, customRPCMainnet],
          });

          expect(result.current.network).toEqual(customRPCMainnet);
        });
      });

      it('gives null as chainId when no wallet is connected', () => {
        const { result } = renderUseCelo({});
        expect(result.current.walletChainId).toBe(null);
      });

      describe('when manualNetworkMode is true', () => {
        it('sets as so in the store', () => {
          const { result } = renderUseCeloInternal({ manualNetworkMode: true });
          expect(result.current.manualNetworkMode).toEqual(true);
        });
      });
    });

    describe('regarding feeCurrency', () => {
      describe('when none given', () => {
        it('defaults to CELO', () => {
          const { result, unmount } = renderUseCelo({});
          expect(result.current.feeCurrency).toEqual(CeloContract.GoldToken);
          unmount();
        });
        it('does not set any feeCurrency on the kit', () => {
          const { result, unmount } = renderUseCelo({});
          expect(result.current.walletType).toEqual('Unauthenticated');
          expect(result.current.kit.connection.defaultFeeCurrency).toEqual(
            undefined
          );
          unmount();
        });
      });

      describe('when feeCurrency WhitelistToken passed', () => {
        beforeEach(() => {
          clearPreviousConfig();
        });
        it('sets that as the feeCurrency', () => {
          const { result } = renderUseCelo({
            feeCurrency: CeloContract.StableTokenBRL,
          });

          expect(result.current.feeCurrency).toEqual(
            CeloContract.StableTokenBRL
          );
        });

        it.todo('sets on the kit');

        it('allows updating feeCurrency', () => {
          const { result } = renderUseCelo({});

          expect(result.current.supportsFeeCurrency).toBe(false);
        });
      });
    });

    it('updates the current theme', () => {
      const { result, rerender } = renderUseCeloInternal({});

      // FIXME Need to determine behavior when network is not in networks
      expect(result.current.network).toEqual(Mainnet);

      act(() => {
        result.current.updateTheme(defaultTheme.light);
      });

      rerender();

      expect(result.current.theme).toEqual({
        background: '#ffffff',
        primary: '#6366f1',
        secondary: '#eef2ff',
        muted: '#e2e8f0',
        error: '#ef4444',
        text: '#000000',
        textSecondary: '#1f2937',
        textTertiary: '#64748b',
      });
    });
  });
});
