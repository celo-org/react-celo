import { CeloTokenContract } from '@celo/contractkit';
import { StableToken } from '@celo/contractkit/lib/celo-tokens';
import { StableTokenWrapper } from '@celo/contractkit/lib/wrappers/StableTokenWrapper';
import {
  Alfajores,
  CeloProvider,
  Theme,
  UseCelo,
  useCelo,
} from '@celo/react-celo';
import { BigNumber } from 'bignumber.js';
import Head from 'next/head';
import { useCallback, useEffect, useState } from 'react';
import Web3 from 'web3';

import { PrimaryButton, SecondaryButton, toast } from '../components';
import CeloLogo from '../components/celo-logo';
import { ThemeButton, themes } from '../components/theme-button';
import { feeTokenMap } from '../utils';
import { sendTestTransaction } from '../utils/send-test-transaction';
import { signTest } from '../utils/sign-test';
import { signTestTypedData } from '../utils/sign-test-typed-data';

interface Summary {
  name: string;
  address: string;
  wallet: string;
  celo: BigNumber;
  balances: { symbol: StableToken; value?: BigNumber; error?: string }[];
}

const defaultSummary: Summary = {
  name: '',
  address: '',
  wallet: '',
  celo: new BigNumber(0),
  balances: [],
};

function truncateAddress(address: string) {
  return `${address.slice(0, 8)}...${address.slice(36)}`;
}
const html =
  typeof document !== 'undefined' &&
  (document.getElementsByTagName('html')[0] as HTMLElement);
function isDark() {
  return html && html.classList.contains('tw-dark');
}

function HomePage(): React.ReactElement {
  const {
    kit,
    address,
    network,
    connect,
    supportsFeeCurrency,
    disconnect,
    performActions,
    walletType,
    feeCurrency,
    updateFeeCurrency,
    updateTheme,
  } = useCelo();

  const [_theme, selectTheme] = useState<Theme | null>(null);
  const [summary, setSummary] = useState(defaultSummary);
  const [sending, setSending] = useState(false);

  const fetchSummary = useCallback(async () => {
    if (!address) {
      setSummary(defaultSummary);
      return;
    }

    const [accounts, goldToken, stableTokens] = await Promise.all([
      kit.contracts.getAccounts(),
      kit.contracts.getGoldToken(),
      Promise.all(
        Object.values(StableToken).map(async (stable) => {
          let contract;
          try {
            contract = await kit.contracts.getStableToken(stable);
          } catch (e) {
            contract = null;
            console.error(e);
          }
          return {
            symbol: stable,
            contract: contract,
          };
        })
      ),
    ]);

    const [accountSummary, celo, balances] = await Promise.all([
      accounts.getAccountSummary(address).catch((e) => {
        console.error(e);
        return defaultSummary;
      }),
      goldToken.balanceOf(address),
      getBalances(stableTokens, address),
    ]);

    setSummary({
      ...accountSummary,
      celo,
      balances,
    });
  }, [address, kit]);

  const wrapAction =
    (
      action: (performActions: UseCelo['performActions']) => Promise<void>,
      actionName: string
    ) =>
    async () => {
      try {
        setSending(true);

        await action(performActions);

        toast.success(`${actionName} succeeded`);
        await fetchSummary();
      } catch (e) {
        toast.error((e as Error).message);
      } finally {
        setSending(false);
      }
    };

  const testSendTransaction = wrapAction(
    sendTestTransaction,
    'sendTransaction'
  );
  const testSignTypedData = wrapAction(signTestTypedData, 'sendTransaction');
  const testSignPersonal = wrapAction(signTest, 'signPersonal');

  const toggleDarkMode = useCallback(() => {
    if (!html) {
      return;
    }
    if (isDark()) {
      html.classList.remove('tw-dark');
      html.classList.remove('dark');
    } else {
      html.classList.add('tw-dark');
      html.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    void fetchSummary();
  }, [fetchSummary]);

  return (
    <div className="w-full">
      <Head>
        <title>react-celo</title>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
      </Head>
      <main className="w-full">
        <section className="flex flex-col justify-center items-center w-full min-h-[285px] p-4  bg-white dark:bg-slate-900 dark:text-white rounded-lg mt-4 border-celo-gold border-solid border">
          <h1 className="text-dark-600 mt-6 pb-4 text-center">
            A{' '}
            <a
              className="underline"
              href="https://reactjs.org/docs/hooks-intro.html"
              target="_blank"
              rel="noreferrer"
            >
              React hook
            </a>{' '}
            to ease connecting to the{' '}
            <a href="https://celo.org/" target="_blank" rel="noreferrer">
              Celo <CeloLogo />
            </a>{' '}
            <SelectChain />
            network.
          </h1>

          {address ? (
            <PrimaryButton onClick={disconnect}>Disconnect</PrimaryButton>
          ) : (
            <PrimaryButton
              onClick={() =>
                connect().catch((e) => toast.error((e as Error).message))
              }
            >
              Use Celo Now
            </PrimaryButton>
          )}

          <div className="text-slate-600 dark:text-slate-200 my-4 max-w-sm  text-center">
            Connect to your wallet of choice, then sign and send a test
            transaction
          </div>
          <div
            className={`flex flex-col items-center justify-center md:flex-row md:space-x-4 my-2 ${
              address || 'hidden'
            }`}
          >
            <SecondaryButton disabled={sending} onClick={testSendTransaction}>
              Test sendTransaction
            </SecondaryButton>
            <SecondaryButton
              disabled={sending}
              onClick={testSignTypedData}
              className="w-full md:w-max"
            >
              Test signTypedData
            </SecondaryButton>
            <SecondaryButton
              disabled={sending}
              onClick={testSignPersonal}
              className="w-full md:w-max"
            >
              Test signPersonal
            </SecondaryButton>
          </div>
        </section>
        <UsedBy />
        <div className="mt-6">
          <div className="text-slate-600 mb-4 max-w-md">
            <h2 className="mb-2 text-lg text-slate-900 dark:text-slate-200">
              Styling
            </h2>
            <p className="text-slate-600 dark:text-slate-200 mb-4">
              React Celo will go dark when tailwinds tw-dark class is on body or
              you can provide a theme
            </p>
            <label className="toggle-dark dark:text-slate-200">
              <span className="toggle-title">
                Toggle modal's dark mode (tw-dark)
              </span>
              <div className="switch">
                <input
                  type="checkbox"
                  onChange={toggleDarkMode}
                  defaultValue={isDark() ? 'checked' : 'unchecked'}
                />
                <span className="slider round "></span>
              </div>
            </label>
            <h3 className="mb-2 text-base dark:text-slate-200">
              Try out some of the pre-made themes below
            </h3>
            <div className="grid grid-flow-col gap-4 my-4">
              {themes.map((theme, i) => (
                <ThemeButton
                  key={i}
                  theme={theme}
                  currentTheme={_theme}
                  onClick={(newTheme) => {
                    updateTheme(newTheme);
                    selectTheme(newTheme);
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col">
            {address && (
              <div className="w-64 md:w-96 space-y-4 text-slate-700 bg-slate-200 dark:bg-black dark:text-white rounded p-4">
                <div className="mb-4">
                  <div className="text-lg font-bold mb-2 text-slate-900 dark:text-slate-200">
                    Account Summary on {network.name}
                  </div>
                  <div className="space-y-2">
                    <div>Wallet type: {walletType}</div>
                    <div>Name: {summary.name || 'Not set'}</div>
                    <div className="">Address: {truncateAddress(address)}</div>
                    <div className="">
                      Wallet address:{' '}
                      {summary.wallet
                        ? truncateAddress(summary.wallet)
                        : 'Not set'}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold mb-2 text-slate-900 dark:text-slate-100">
                    Balances
                  </div>
                  <div className="space-y-2">
                    <div>
                      CELO: {Web3.utils.fromWei(summary.celo.toFixed())}
                    </div>
                    {summary.balances.map((token) => (
                      <div key={token.symbol}>
                        {token.symbol}:{' '}
                        {token.value
                          ? Web3.utils.fromWei(token.value.toFixed())
                          : token.error}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold mb-2 text-slate-900 dark:text-slate-100">
                    Fee Currency{' '}
                    {supportsFeeCurrency || `not supported on ${walletType}`}
                  </div>
                  <select
                    disabled={!supportsFeeCurrency}
                    value={feeCurrency}
                    onChange={(event) =>
                      updateFeeCurrency(event.target.value as CeloTokenContract)
                    }
                    className="border border-slate-300 rounded px-4 py-2"
                  >
                    {Object.keys(feeTokenMap).map((token) => (
                      <option key={token} value={token}>
                        {feeTokenMap[token as keyof typeof feeTokenMap]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
async function getBalances(
  stableTokens: { symbol: StableToken; contract: StableTokenWrapper | null }[],
  address: string
) {
  return Promise.all(
    stableTokens.map(async (stable) => {
      let value, error;
      if (stable.contract) {
        value = await stable.contract.balanceOf(address);
      } else {
        error = 'not deployed in network';
      }
      return {
        symbol: stable.symbol,
        value: value,
        error: error,
      };
    })
  );
}

export default function Home(): React.ReactElement {
  return (
    <CeloProvider
      dapp={{
        name: 'react-celo demo',
        description: 'A demo DApp to showcase functionality',
        url: 'https://react-celo.vercel.app',
        icon: 'https://react-celo.vercel.app/favicon.ico',
      }}
      defaultNetwork={Alfajores.name}
      connectModal={{
        providersOptions: { searchable: true },
      }}
    >
      <HomePage />
    </CeloProvider>
  );
}

function UsedBy() {
  return (
    <div className="mt-6 flex flex-col items-center">
      <h2 className="mb-2 text-lg dark:text-white">Used by</h2>
      <ul className="flex gap-6">
        {[
          {
            name: 'Celo Tracker ',
            url: 'https://www.celotracker.com/',
          },
          {
            name: 'Mobius Money',
            url: 'https://mobius.money/',
          },
          {
            name: 'Impact Market',
            url: 'https://www.impactmarket.com/',
          },
          {
            name: 'Add yours to the list...',
            url: 'https://github.com/celo-org/react-celo/',
          },
        ].map(({ name, url }) => (
          <li key={name}>
            <a
              target="_blank"
              className="text-rc-violet"
              href={url}
              rel="noreferrer"
            >
              {name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SelectChain() {
  const { network, networks, updateNetwork } = useCelo();
  return (
    <select
      className="border border-celo-gold outline-celo-gold-light text-slate-800 rounded px-1 py-1 mr-1"
      value={network.name}
      onChange={async (e) => {
        const newNetwork = networks.find((n) => n.name === e.target.value);
        if (newNetwork) {
          await updateNetwork(newNetwork);
        }
      }}
    >
      {Object.values(networks).map((n) => (
        <option key={n.name} value={n.name}>
          {n.name}
        </option>
      ))}
    </select>
  );
}
