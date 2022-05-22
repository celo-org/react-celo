import { CeloContract, CeloTokenContract } from '@celo/contractkit';
import { StableToken } from '@celo/contractkit/lib/celo-tokens';
import { StableTokenWrapper } from '@celo/contractkit/lib/wrappers/StableTokenWrapper';
import { Theme, useCelo } from '@celo/react-celo';
import { ensureLeading0x } from '@celo/utils/lib/address';
import { BigNumber } from 'bignumber.js';
import Head from 'next/head';
import { useCallback, useEffect, useState } from 'react';
import Web3 from 'web3';

import { PrimaryButton, SecondaryButton, toast } from '../components';
import { ThemeButton, themes } from '../components/theme-button';
import { TYPED_DATA } from '../utils';

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

type FeeTokenMap = { [FeeToken in CeloTokenContract]: string };

const feeTokenMap: FeeTokenMap = {
  [CeloContract.GoldToken]: 'Celo',
  [CeloContract.StableToken]: 'cUSD',
  [CeloContract.StableTokenEUR]: 'cEUR',
  [CeloContract.StableTokenBRL]: 'cREAL',
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

export default function Home(): React.ReactElement {
  const {
    kit,
    address,
    network,
    networks,
    updateNetwork,
    connect,
    supportsFeeCurrency,
    destroy,
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

    const [summary, celo, balances] = await Promise.all([
      accounts.getAccountSummary(address).catch((e) => {
        console.error(e);
        return defaultSummary;
      }),
      goldToken.balanceOf(address),
      getBalances(stableTokens, address),
    ]);

    setSummary({
      ...summary,
      celo,
      balances,
    });
  }, [address, kit]);

  const testSendTransaction = async () => {
    try {
      setSending(true);

      await performActions(async (k) => {
        const celo = await k.contracts.getGoldToken();
        await celo
          .transfer(
            // impact market contract
            '0x73D20479390E1acdB243570b5B739655989412f5',
            Web3.utils.toWei('0.00000001', 'ether')
          )
          .sendAndWaitForReceipt({
            from: k.connection.defaultAccount,
            gasPrice: k.connection.defaultGasPrice,
          });
      });

      toast.success('sendTransaction succeeded');
      await fetchSummary();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSending(false);
    }
  };

  const testSignTypedData = async () => {
    setSending(true);
    try {
      await performActions(async (k) => {
        if (k.connection.defaultAccount) {
          return await k.connection.signTypedData(
            k.connection.defaultAccount,
            TYPED_DATA
          );
        } else {
          throw new Error('No default account');
        }
      });
      toast.success('signTypedData succeeded');
    } catch (e) {
      toast.error((e as Error).message);
    }

    setSending(false);
  };

  const testSignPersonal = async () => {
    setSending(true);
    try {
      await performActions(async (k) => {
        if (!k.connection.defaultAccount) {
          throw new Error('No default account');
        }
        return await k.connection.sign(
          ensureLeading0x(Buffer.from('Hello').toString('hex')),
          k.connection.defaultAccount
        );
      });
      toast.success('sign_personal succeeded');
    } catch (e) {
      toast.error((e as Error).message);
    }

    setSending(false);
  };

  const toggleDarkMode = useCallback(() => {
    if (isDark()) {
      html && html.classList.remove('tw-dark');
    } else {
      html && html.classList.add('tw-dark');
    }
  }, []);

  useEffect(() => {
    void fetchSummary();
  }, [fetchSummary]);

  return (
    <div>
      <Head>
        <title>react-celo</title>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </Head>

      <div className="toggle-dark">
        <span>Toggle modal's dark mode</span>
        <label className="switch">
          <input
            type="checkbox"
            onChange={toggleDarkMode}
            defaultValue={isDark() ? 'checked' : 'unchecked'}
          />
          <span className="slider round"></span>
        </label>
      </div>

      <main className="max-w-screen-sm mx-auto py-10 md:py-20 px-4">
        <div className="font-semibold text-2xl">react-celo</div>
        <div className="text-slate-600 mt-2">
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
          <a
            href="https://celo.org/"
            target="_blank"
            style={{ color: 'rgba(53,208,127,1.00)' }}
            rel="noreferrer"
          >
            Celo{' '}
            <svg
              data-name="Celo Rings"
              viewBox="0 0 950 950"
              className="inline h-4 w-4 mb-1"
            >
              <path
                data-name="Top Ring"
                d="M575 650c151.88 0 275-123.12 275-275S726.88 100 575 100 300 223.12 300 375s123.12 275 275 275zm0 100c-207.1 0-375-167.9-375-375S367.9 0 575 0s375 167.9 375 375-167.9 375-375 375z"
                fill="#35d07f"
              />
              <path
                data-name="Bottom Ring"
                d="M375 850c151.88 0 275-123.12 275-275S526.88 300 375 300 100 423.12 100 575s123.12 275 275 275zm0 100C167.9 950 0 782.1 0 575s167.9-375 375-375 375 167.9 375 375-167.9 375-375 375z"
                fill="#fbcc5c"
              />
              <path
                data-name="Rings Overlap"
                d="M587.39 750a274.38 274.38 0 0054.55-108.06A274.36 274.36 0 00750 587.4a373.63 373.63 0 01-29.16 133.45A373.62 373.62 0 01587.39 750zM308.06 308.06A274.36 274.36 0 00200 362.6a373.63 373.63 0 0129.16-133.45A373.62 373.62 0 01362.61 200a274.38 274.38 0 00-54.55 108.06z"
                fill="#ecff8f"
              />
            </svg>
          </a>{' '}
          network.
        </div>

        <div className="mt-6">
          <div className="mb-2 text-lg">Find it on:</div>
          <ul className="list-disc list-inside">
            <li>
              <a
                className="text-blue-500"
                target="_blank"
                href="https://www.npmjs.com/package/@celo/react-celo"
                rel="noreferrer"
              >
                NPM
              </a>
            </li>
            <li>
              <a
                className="text-blue-500"
                target="_blank"
                href="https://github.com/celo-tools/react-celo"
                rel="noreferrer"
              >
                GitHub
              </a>
            </li>
          </ul>
        </div>

        <div className="mt-6">
          <div className="mb-2 text-lg">Used by:</div>
          <ul className="list-disc list-inside">
            {[
              {
                name: 'Plock',
                url: 'https://plock.fi',
              },
              {
                name: 'Web multi sig interface',
                url: 'https://celo-data.nambrot.com/multisig',
              },
              {
                name: 'Poof Cash',
                url: 'https://poof.cash',
              },
              {
                name: 'Nomspace',
                url: 'https://www.nom.space/',
              },
              {
                name: 'Romulus',
                url: 'https://romulus.page/',
              },
              {
                name: 'Add yours to the list...',
                url: 'https://github.com/celo-tools/react-celo',
              },
            ].map(({ name, url }) => (
              <li key={name}>
                <a
                  target="_blank"
                  className="text-blue-500"
                  href={url}
                  rel="noreferrer"
                >
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <div className="mb-2 text-lg">Try it out</div>
          <div className="text-slate-600 mb-4">
            Connect to your wallet of choice and sign something for send a test
            transaction
            <br />
            <a target="_blank" className="text-blue-500" href="/wallet">
              Example wallet
            </a>
          </div>
          <div className="text-slate-600 mb-4">
            <div className="grid grid-flow-col gap-4 my-4">
              {themes.map((theme, i) => (
                <ThemeButton
                  key={i}
                  theme={theme}
                  currentTheme={_theme}
                  onClick={(theme) => {
                    updateTheme(theme);
                    selectTheme(theme);
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center space-x-8 mb-4">
              <select
                className="border border-slate-300 rounded px-4 py-2"
                value={network.name}
                onChange={async (e) => {
                  const newNetwork = networks.find(
                    (n) => n.name === e.target.value
                  );
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
              {address ? (
                <SecondaryButton onClick={destroy}>Disconnect</SecondaryButton>
              ) : (
                <SecondaryButton
                  onClick={() =>
                    connect().catch((e) => toast.error((e as Error).message))
                  }
                >
                  Connect
                </SecondaryButton>
              )}
            </div>

            <div className="flex flex-col md:flex-row md:space-x-4 mb-6">
              <PrimaryButton
                disabled={sending}
                onClick={testSendTransaction}
                className="w-full md:w-max"
              >
                Test sendTransaction
              </PrimaryButton>
              <PrimaryButton
                disabled={sending}
                onClick={testSignTypedData}
                className="w-full md:w-max"
              >
                Test signTypedData
              </PrimaryButton>
              <PrimaryButton
                disabled={sending}
                onClick={testSignPersonal}
                className="w-full md:w-max"
              >
                Test signPersonal
              </PrimaryButton>
            </div>

            {address && (
              <div className="w-64 md:w-96 space-y-4 text-slate-700">
                <div className="mb-4">
                  <div className="text-lg font-bold mb-2 text-slate-900">
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
                  <div className="text-lg font-bold mb-2 text-slate-900">
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
                  <div className="text-lg font-bold mb-2 text-slate-900">
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
                        {feeTokenMap[token as keyof FeeTokenMap]}
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
