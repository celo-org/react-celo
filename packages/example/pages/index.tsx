import Head from 'next/head';
import { useCallback, useEffect, useState } from 'react';
import Loader from 'react-loader-spinner';
import { Networks, useContractKit } from 'use-contractkit';
import Web3 from 'web3';

const defaultSummary = {
  name: '',
  address: '',
  wallet: '',
  authorizedSigners: {
    vote: '',
    attestation: '',
    validator: '',
  },
  celo: '',
  cusd: '',
};

function truncateAddress(address: string) {
  return `${address.slice(0, 8)}...${address.slice(36)}`;
}

export default function Home() {
  const {
    kit,
    address,
    network,
    updateNetwork,
    openModal,
    destroy,
    requireConnected,
  } = useContractKit();
  const [summary, setSummary] = useState(defaultSummary);
  const [sending, setSending] = useState(false);

  const fetchSummary = useCallback(async () => {
    if (!address) {
      setSummary(defaultSummary);
      return;
    }

    const [accounts, goldToken, stableToken] = await Promise.all([
      kit.contracts.getAccounts(),
      kit.contracts.getGoldToken(),
      kit.contracts.getStableToken(),
    ]);
    const [summary, celo, cusd] = await Promise.all([
      accounts.getAccountSummary(address).catch((e) => defaultSummary),
      goldToken.balanceOf(address).then((x) => x.toString()),
      stableToken.balanceOf(address).then((x) => x.toString()),
    ]);
    setSummary({
      ...summary,
      celo,
      cusd,
    });
  }, [address]);

  const sendTestTransaction = async () => {
    if (!kit.defaultAccount) {
      openModal();
      return;
    }

    setSending(true);
    const celo = await kit.contracts.getGoldToken();
    await celo
      // impact market contract
      .transfer(
        '0x73D20479390E1acdB243570b5B739655989412f5',
        Web3.utils.toWei('0.01', 'ether')
      )
      .sendAndWaitForReceipt();

    fetchSummary();
    setSending(false);
    console.log('Sent!');
  };

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return (
    <div>
      <Head>
        <title>use-contractkit</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="max-w-screen-sm mx-auto py-10 md:py-20 px-4">
        <div className="font-medium text-2xl">use-contractkit</div>
        <div className="text-gray-600 mt-2">
          A{' '}
          <a
            className="underline"
            href="https://reactjs.org/docs/hooks-intro.html"
            target="_blank"
          >
            React hook
          </a>{' '}
          to ease connecting to the{' '}
          <a
            href="https://celo.org/"
            target="_blank"
            style={{ color: 'rgba(53,208,127,1.00)' }}
          >
            Celo
          </a>{' '}
          network.
        </div>

        <div className="mt-8">
          <div className="text-xl mb-2">Find it on:</div>
          <ul className="list-disc list-inside">
            <li>
              <a
                className="text-blue-500"
                target="_blank"
                href="https://www.npmjs.com/settings/alexbh/packages"
              >
                NPM
              </a>
            </li>
            <li>
              <a
                className="text-blue-500"
                target="_blank"
                href="https://github.com/AlexBHarley/use-contractkit"
              >
                GitHub
              </a>
            </li>
          </ul>
        </div>

        <div className="mt-8">
          <div className="text-xl mb-2">Used by:</div>
          <ul className="list-disc list-inside">
            <li>
              <a
                target="_blank"
                className="text-blue-500"
                href="https://celo-dapp.vercel.app"
              >
                Celo Home
              </a>
            </li>
            <li>
              <a
                className="text-blue-500"
                target="_blank"
                href="https://github.com/AlexBHarley/use-contractkit"
              >
                Add yours to the list...
              </a>
            </li>
          </ul>
        </div>

        <div className="mt-8">
          <div className="text-xl mb-4">Demo</div>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center space-x-8 mb-4">
              <select
                className="border border-gray-300 rounded px-4 py-2"
                value={network}
                onChange={(e) => updateNetwork(e.target.value as Networks)}
              >
                {Object.values(Networks).map((n) => (
                  <option>{n}</option>
                ))}
              </select>
              {address ? (
                <button
                  onClick={destroy}
                  className="px-4 py-2 border border-transparent text-base font-medium text-gradient bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 outline-none focus:outline-none"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={openModal}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  Connect
                </button>
              )}
            </div>
            {address ? (
              <div className="w-64 md:w-96 space-y-4 text-gray-700">
                <div className="mb-4">
                  <div className="text-lg font-bold mb-2 text-gray-900">
                    Account summary
                  </div>
                  <div className="space-y-2">
                    <div>Name: {summary.name || 'Not set'}</div>
                    <div className="">
                      Address: {truncateAddress(summary.address)}
                    </div>
                    <div className="">
                      Wallet: {truncateAddress(summary.wallet)}
                    </div>

                    <div>
                      <div className="font-medium text-gray-900">Signers</div>
                      <div className="ml-4">
                        {Object.keys(summary.authorizedSigners).map(
                          (signer) => (
                            <div className="mt-1">
                              {signer}:{' '}
                              {summary.authorizedSigners[signer]
                                ? truncateAddress(
                                    summary.authorizedSigners[signer]
                                  )
                                : 'Not set'}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold mb-2 text-gray-900">
                    Balances
                  </div>
                  <div className="space-y-2">
                    <div>
                      CELO: {Web3.utils.fromWei(summary.celo.toString())}
                    </div>
                    <div>
                      cUSD: {Web3.utils.fromWei(summary.cusd.toString())}
                    </div>
                    <div>cEUR: 0.00</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div>
                    <div className="text-lg font-bold mb-2 text-gray-900">
                      Send a test transaction
                    </div>
                    <p className="text-gray-600 text-sm">
                      Will donate 0.01 CELO to{' '}
                      <a
                        href="https://impactmarket.com/"
                        className="underline"
                        target="_blank"
                      >
                        Impact Market
                      </a>
                    </p>
                  </div>

                  {sending ? (
                    <span>
                      <Loader type="TailSpin" height={'24px'} width="24px" />
                    </span>
                  ) : (
                    <button
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 mt-2 ml-auto"
                      onClick={sendTestTransaction}
                    >
                      Send
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <span className="text-gray-500">No account connected</span>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
