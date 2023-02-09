import { trimLeading0x } from '@celo/base';
import { StableToken } from '@celo/contractkit/lib/celo-tokens';
import { newKitFromWeb3 } from '@celo/contractkit/lib/mini-kit';
import { Alfajores } from '@celo/react-celo';
import { EIP712TypedData } from '@celo/utils/lib/sign-typed-data-utils';
import { SupportedMethods } from '@celo/wallet-walletconnect';
// import WalletConnect from '@walletconnect/client';
import SignClient from '@walletconnect/sign-client';
import { SessionTypes, SignClientTypes } from '@walletconnect/types';
import { getSdkError } from '@walletconnect/utils';
import { BigNumber } from 'bignumber.js';
import Head from 'next/head';
import { createRef, useCallback, useEffect, useState } from 'react';
import Modal from 'react-modal';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-core/types';

import { PrimaryButton } from '../components';

let signClient: SignClient | null;
const WALLET_CONNECT_PROJECT_ID = 'f597db9e215becf1a4b24a7154c26fa2'; // this is nico's walletconnect project id

const web3 = new Web3(Alfajores.rpcUrl);
const kit = newKitFromWeb3(web3);
const account = web3.eth.accounts.privateKeyToAccount(
  'e2d7138baa3a5600ac37984e40981591d7cf857bcadd7dc6f7d14023a17b0787'
);
kit.connection.addAccount(account.privateKey);
const wallet = kit.getWallet()!;

const defaultSummary = {
  name: '',
  address: '',
  wallet: '',
  celo: new BigNumber(0),
  cusd: new BigNumber(0),
  ceur: new BigNumber(0),
};

function truncateAddress(address: string) {
  return `${address.slice(0, 8)}...${address.slice(36)}`;
}

export default function Wallet(): React.ReactElement {
  const inputRef = createRef<HTMLInputElement>();
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<SessionTypes.Struct | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [summary, setSummary] = useState(defaultSummary);
  const [approvalData, setApprovalData] = useState<{
    accept: () => void;
    reject: () => void;
    meta: {
      title: string;
      raw: unknown;
    };
  } | null>(null);

  const fetchSummary = useCallback(async () => {
    const [accounts, goldToken, cUSD, cEUR] = await Promise.all([
      kit.contracts.getAccounts(),
      kit.contracts.getGoldToken(),
      kit.contracts.getStableToken(StableToken.cUSD),
      kit.contracts.getStableToken(StableToken.cEUR),
    ]);

    const [accountSummary, celo, cusd, ceur] = await Promise.all([
      accounts.getAccountSummary(account.address).catch((e) => {
        console.error(e);
        return defaultSummary;
      }),
      goldToken.balanceOf(account.address),
      cUSD.balanceOf(account.address),
      cEUR.balanceOf(account.address),
    ]);

    setSummary({
      ...accountSummary,
      celo,
      cusd,
      ceur,
    });
  }, []);

  const connect = useCallback(async () => {
    if (!inputRef.current || !signClient) {
      return;
    }

    const uri = inputRef.current.value.trim();
    if (!uri || !uri.startsWith('wc:')) {
      setError('Bad wc uri, should be in the form of "wc:…"');
      return;
    }
    setError(null);
    await signClient.core.pairing.pair({
      uri,
    });
  }, [inputRef]);

  const approveConnection = useCallback(
    async ({
      id,
      params: { pairingTopic, requiredNamespaces },
    }: SignClientTypes.EventArguments['session_proposal']) => {
      if (!signClient || !pairingTopic) return;

      const { topic: _topic, acknowledged } = await signClient.approve({
        id,
        namespaces: {
          eip155: {
            accounts: requiredNamespaces.eip155.chains.map(
              (x) => `${x}:${account.address}`
            ),
            methods: requiredNamespaces.eip155.methods,
            events: requiredNamespaces.eip155.events,
          },
        },
      });
      setTopic(_topic);
      setSession(await acknowledged());
      setApprovalData(null);
    },
    [setSession]
  );

  const rejectConnection = useCallback(
    async (id?: number): Promise<void> => {
      if (!signClient) return;

      if (id) {
        await signClient.reject({ id, reason: getSdkError('USER_REJECTED') });
      } else {
        await signClient.disconnect({
          topic: topic!,
          reason: getSdkError('USER_DISCONNECTED'),
        });
      }
      await signClient.session.delete(topic!, getSdkError('USER_DISCONNECTED'));
      setApprovalData(null);
      setSession(null);
      signClient = null;
    },
    [topic]
  );

  const reject = useCallback(
    async (id: number, message: string) => {
      if (!signClient) return;

      await signClient.respond({
        topic: topic!,
        response: {
          id: id,
          jsonrpc: '2.0',
          error: {
            message,
            code: 5000,
          },
        },
      });
      setApprovalData(null);
    },
    [topic]
  );

  const signTransaction = useCallback(
    async (id: number, params: TransactionConfig) => {
      if (!signClient) return;

      const result = await wallet.signTransaction({
        ...params,
        chainId: Alfajores.chainId,
      });

      await signClient.respond({
        topic: topic!,
        response: { id, result, jsonrpc: Alfajores.rpcUrl },
      });

      setTimeout(() => void fetchSummary(), 5000);
      setApprovalData(null);
    },
    [session, fetchSummary]
  );

  const personalSign = useCallback(
    async (id: number, message: string) => {
      if (!signClient) return;

      const result = await wallet.signPersonalMessage(account.address, message);
      await signClient.respond({
        topic: topic!,
        response: { id, result, jsonrpc: Alfajores.rpcUrl },
      });
      setApprovalData(null);
    },
    [topic]
  );

  const signTypedData = useCallback(
    async (id: number, data: EIP712TypedData) => {
      if (!signClient) return;

      const result = await wallet.signTypedData(account.address, data);
      await signClient.respond({
        topic: topic!,
        response: { id, result, jsonrpc: Alfajores.rpcUrl },
      });
      setApprovalData(null);
    },
    [topic]
  );

  const accounts = useCallback(
    async (id: number) => {
      if (!signClient) return;

      const result = wallet.getAccounts();
      await signClient.respond({
        topic: topic!,
        response: { id, result, jsonrpc: Alfajores.rpcUrl },
      });
      setApprovalData(null);
    },
    [topic]
  );

  const decrypt = useCallback(
    async (id: number, data: string) => {
      if (!signClient) return;

      const result = await wallet.decrypt(
        account.address,
        Buffer.from(data, 'hex')
      );

      await signClient.respond({
        topic: topic!,
        response: { id, result, jsonrpc: Alfajores.rpcUrl },
      });
      setApprovalData(null);
    },
    [topic]
  );

  const computeSharedSecret = useCallback(
    async (id: number, publicKey: string) => {
      if (!signClient) return;

      const result = await wallet.computeSharedSecret(
        account.address,
        publicKey
      );

      await signClient.respond({
        topic: topic!,
        response: { id, result, jsonrpc: Alfajores.rpcUrl },
      });
      setApprovalData(null);
    },
    [topic]
  );

  const handleNewRequests = useCallback(
    ({
      id,
      params: { request, chainId },
    }: SignClientTypes.EventArguments['session_request']): void | Promise<void> => {
      if (chainId !== `eip155:${Alfajores.chainId}`) {
        return signClient?.reject({
          id,
          reason: getSdkError('UNSUPPORTED_CHAINS'),
        });
      }
      let decodedMessage: string;

      switch (request.method as SupportedMethods) {
        case SupportedMethods.accounts:
          return setApprovalData({
            accept: () => accounts(id),
            reject: () => reject(id, `User rejected computeSharedSecret ${id}`),
            meta: {
              title: `Send all accounts of this wallet?`,
              raw: request,
            },
          });
        case SupportedMethods.signTransaction:
          return setApprovalData({
            accept: () =>
              signTransaction(id, request.params as TransactionConfig),
            reject: () => reject(id, `User rejected transaction ${id}`),
            meta: {
              // TODO: Find out how the value can be determined from the payload// eslint-disable-next-line
              // eslint-disable-next-line
              title: `Transfer ${request.params.value} CELO from ${request.params.from} to ${request.params.to}`,
              raw: request,
            },
          });
        case SupportedMethods.personalSign:
          decodedMessage = Buffer.from(
            trimLeading0x((request.params as string[])[0]),
            'hex'
          ).toString('utf8');
          return setApprovalData({
            accept: () => personalSign(id, (request.params as string[])[0]),
            reject: () => reject(id, `User rejected personalSign ${id}`),
            meta: {
              title: `Sign this message: ${decodedMessage}`,
              raw: request,
            },
          });
        case SupportedMethods.signTypedData:
          return setApprovalData({
            accept: () =>
              signTypedData(
                id,
                JSON.parse((request.params as string[])[1]) as EIP712TypedData
              ),
            reject: () => reject(id, `User rejected signTypedData ${id}`),
            meta: {
              title: `Sign this typed data`,
              raw: request,
            },
          });
        case SupportedMethods.decrypt:
          return setApprovalData({
            accept: () => decrypt(id, (request.params as string[])[1]),
            reject: () => reject(id, `User rejected decrypt ${id}`),
            meta: {
              title: `Decrypt this encrypted message`,
              raw: request,
            },
          });
        case SupportedMethods.computeSharedSecret:
          return setApprovalData({
            accept: () =>
              computeSharedSecret(id, (request.params as string[])[1]),
            reject: () => reject(id, `User rejected computeSharedSecret ${id}`),
            meta: {
              title: `Compute a shared secret for this publickey ${
                (request.params as string[])[1]
              }`,
              raw: request,
            },
          });
      }
    },
    [
      accounts,
      computeSharedSecret,
      decrypt,
      personalSign,
      reject,
      signTransaction,
      signTypedData,
    ]
  );

  useEffect(() => {
    void fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    if (signClient) return;

    void SignClient.init({
      projectId: WALLET_CONNECT_PROJECT_ID,
      logger: 'debug',
      metadata: {
        description: 'This is a test-wallet, do not use with real funds',
        url: 'https://react-celo.vercel.app/wallet',
        icons: ['https://avatars.githubusercontent.com/u/37552875?s=200&v=4'],
        name: 'React-celo test wallet',
      },
    }).then(async (client) => {
      client.on('session_proposal', (requestEvent) => {
        setApprovalData({
          accept: () => approveConnection(requestEvent),
          reject: () => rejectConnection(requestEvent.id),
          meta: {
            title: `new connection from dApp ${requestEvent.params.proposer.metadata.name}`,
            raw: requestEvent,
          },
        });
      });

      signClient = client;
      if (client.session) {
        const _session = client.session
          .getAll()
          .sort((a, b) => b.expiry - a.expiry)
          .find((x) => x.acknowledged && x.expiry * 1000 > Date.now());

        if (_session) {
          await client.extend({
            topic: _session.topic,
          });
          setSession(_session);
          setTopic(_session.topic);
        }
      }
    });
  }, [approveConnection, handleNewRequests, rejectConnection]);

  useEffect(() => {
    if (!signClient) return;

    signClient.on('session_request', handleNewRequests);
    signClient.on('session_delete', async (params) => {
      await signClient?.session.delete(
        params.topic,
        getSdkError('USER_DISCONNECTED')
      );
    });
    return () => {
      signClient && signClient.off('session_request', handleNewRequests);
    };
  }, [handleNewRequests]);

  const connected = signClient && session?.peer;
  return (
    <>
      <Head>
        <title>react-celo wallet</title>
        <link rel="icon" href="/favicon.ico?v=2" />
      </Head>

      <main>
        <div className="font-semibold text-2xl dark:text-slate-200">
          react-celo wallet
        </div>

        <input
          style={{
            padding: 10,
            border: '1px solid #aaa',
            color: signClient ? '#777' : '#000',
          }}
          ref={inputRef}
          type="text"
          placeholder={
            connected ? session.peer.metadata.name : 'Paste your wc url here...'
          }
          disabled={!!connected}
        />
        <PrimaryButton
          onClick={() => (connected ? rejectConnection() : connect())}
        >
          {connected ? 'Disconnect' : 'Connect'}
        </PrimaryButton>
        <div className={error ? '' : 'hidden'}>
          <span className="text-red-500">{error}</span>
        </div>
        <div className="w-64 md:w-96 space-y-4 text-slate-700 dark:text-slate-100">
          <div className="mb-4">
            <div className="text-lg font-bold mb-2 text-slate-900 dark:text-slate-200">
              Account summary
            </div>
            <div className="space-y-2">
              <div>
                walletconnect status: {connected ? 'connected' : 'disconnected'}
              </div>
              <div>Name: {summary.name || 'Not set'}</div>
              <div className="">
                Address: {truncateAddress(account.address)}
              </div>
              <div className="">
                Wallet address:{' '}
                {summary.wallet ? truncateAddress(summary.wallet) : 'Not set'}
              </div>
            </div>
          </div>
          <div>
            <div className="text-lg font-bold mb-2 text-slate-900 dark:text-slate-200">
              Balances
            </div>
            <div className="space-y-2">
              <div>CELO: {Web3.utils.fromWei(summary.celo.toFixed())}</div>
              <div>cUSD: {Web3.utils.fromWei(summary.cusd.toFixed())}</div>
              <div>cEUR: {Web3.utils.fromWei(summary.ceur.toFixed())}</div>
            </div>
          </div>
        </div>
        <Modal
          ariaHideApp={false}
          isOpen={!!approvalData}
          onRequestClose={approvalData?.reject}
          style={{
            content: {
              top: '50%',
              left: '50%',
              right: 'auto',
              bottom: 'auto',
              marginRight: '-50%',
              transform: 'translate(-50%, -50%)',
              maxWidth: '90vw',
              maxHeight: '90vh',
            },
          }}
          contentLabel="Approve walletconnect request?"
        >
          <h2 className="dark:text-slate-200">
            Approve: <b>{approvalData?.meta.title}</b> ?
          </h2>
          <pre style={{ fontSize: 8 }}>
            {JSON.stringify(approvalData, null, 2)}
          </pre>
          <div className="flex flex-col md:flex-row md:space-x-4 mb-6 dark:text-slate-200">
            <PrimaryButton
              onClick={approvalData?.reject}
              className="w-full md:w-max"
            >
              Reject
            </PrimaryButton>
            <PrimaryButton
              onClick={approvalData?.accept}
              className="w-full md:w-max"
            >
              Approve
            </PrimaryButton>
          </div>
        </Modal>
      </main>
    </>
  );
}
