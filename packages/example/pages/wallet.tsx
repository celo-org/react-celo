import { Alfajores } from '@celo-tools/use-contractkit';
import { trimLeading0x } from '@celo/base';
import { newKitFromWeb3 } from '@celo/contractkit';
import { EIP712TypedData } from '@celo/utils/lib/sign-typed-data-utils';
import WalletConnect from '@walletconnect/client';
import Head from 'next/head';
import { createRef, useCallback, useEffect, useState } from 'react';
import Modal from 'react-modal';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-core';

import { PrimaryButton, SecondaryButton } from '../components';

const WALLET_ID = 'test-wallet-clabs';

export enum SupportedMethods {
  accounts = 'eth_accounts',
  signTransaction = 'eth_signTransaction',
  personalSign = 'personal_sign',
  signTypedData = 'eth_signTypedData',
  decrypt = 'personal_decrypt',
  computeSharedSecret = 'personal_computeSharedSecret',
}

const CLIENT_EVENTS = {
  connect: 'connect',
  disconnect: 'disconnect',
  session_request: 'session_request',
  session_update: 'session_update',
  call_request: 'call_request',
  wc_sessionRequest: 'wc_sessionRequest',
  wc_sessionUpdate: 'wc_sessionUpdate',
};

const web3 = new Web3(Alfajores.rpcUrl);
const kit = newKitFromWeb3(web3);
const account = web3.eth.accounts.privateKeyToAccount(
  'e2d7138baa3a5600ac37984e40981591d7cf857bcadd7dc6f7d14023a17b0787'
);
kit.addAccount(account.privateKey);

export default function Wallet(): React.ReactElement {
  const inputRef = createRef<HTMLInputElement>();
  const [error, setError] = useState<string | null>(null);
  const [connector, setConnector] = useState<WalletConnect | null>(null);
  const [approvalData, setApprovalData] = useState<{
    accept: () => void;
    reject: () => void;
    meta: {
      title: string;
      raw: unknown;
    };
  } | null>(null);

  const connect = useCallback(() => {
    if (!inputRef.current) {
      return;
    }

    const uri = inputRef.current.value.trim();
    if (!uri || !uri.startsWith('wc:')) {
      setError('Bad wc uri, should be in the form of "wc:…"');
      return;
    }
    setError(null);

    // Create connector
    const _connector = new WalletConnect({
      uri,
      clientMeta: {
        description: 'WalletConnect Developer App',
        url: 'https://walletconnect.org',
        icons: ['https://walletconnect.org/walletconnect-logo.png'],
        name: 'WalletConnect',
      },
      storageId: WALLET_ID,
    });
    setConnector(_connector);
  }, [inputRef]);

  const approveConnection = useCallback(() => {
    if (!connector) return;
    connector.approveSession({
      chainId: Alfajores.chainId,
      accounts: [account.address],
      networkId: 0,
      rpcUrl: Alfajores.rpcUrl,
    });
    setApprovalData(null);
  }, [connector]);

  const rejectConnection = useCallback(async (): Promise<void> => {
    if (!connector) return;
    if (!connector.session?.connected) {
      connector.rejectSession({
        message: 'Test wallet rejected the connection manually',
      });
      setApprovalData(null);
    } else {
      await connector.killSession();
    }

    setConnector(null);
  }, [connector]);

  const reject = useCallback(
    (id: number, message: string) => {
      if (!connector) return;

      connector.rejectRequest({
        id,
        error: {
          message,
        },
      });
    },
    [connector]
  );

  const signTransaction = useCallback(
    async (id: number, params: TransactionConfig) => {
      if (!connector) return;

      await account.signTransaction(params).then((signedTx) => {
        connector.approveRequest({
          id,
          result: { raw: signedTx.rawTransaction },
        });
      });
      setApprovalData(null);
    },
    [connector]
  );

  const personalSign = useCallback(
    (id: number, message: string) => {
      if (!connector) return;

      const result = account.sign(message);
      connector.approveRequest({
        id,
        result: result.signature,
      });
      setApprovalData(null);
    },
    [connector]
  );

  const signTypedData = useCallback(
    async (id: number, data: EIP712TypedData) => {
      if (!connector) return;

      const result = await kit.signTypedData(account.address, data);

      connector.approveRequest({
        id,
        result: result,
      });
      setApprovalData(null);
    },
    [connector]
  );

  const handleNewRequests = useCallback(
    (
      error: Error | null,
      payload: { id: number; method: string; params: unknown[] }
    ) => {
      if (error) return setError(error.message);

      console.log('call_request', payload);
      let decodedMessage: string;

      switch (payload.method) {
        case SupportedMethods.accounts:
          break;
        case SupportedMethods.signTransaction:
          setApprovalData({
            accept: () =>
              signTransaction(
                payload.id,
                payload.params[0] as TransactionConfig
              ),
            reject: () =>
              reject(payload.id, `User rejected transaction ${payload.id}`),
            meta: {
              // TODO: Find out how the value can be determined from the payload
              // eslint-disable-next-line
              title: `Transfer ${payload.params[0].value} CELO from ${payload.params[0].from} to ${payload.params[0].to}`,
              raw: payload,
            },
          });
          break;
        case SupportedMethods.personalSign:
          decodedMessage = Buffer.from(
            trimLeading0x(payload.params[0] as string),
            'hex'
          ).toString('utf8');
          setApprovalData({
            accept: () => personalSign(payload.id, payload.params[0] as string),
            reject: () =>
              reject(payload.id, `User rejected personalSign ${payload.id}`),
            meta: {
              // eslint-disable-next-line
              title: `Sign this message: ${decodedMessage}`,
              raw: payload,
            },
          });
          break;
        case SupportedMethods.signTypedData:
          setApprovalData({
            accept: () =>
              signTypedData(payload.id, payload.params[0] as EIP712TypedData),
            reject: () =>
              reject(payload.id, `User rejected signTypedData ${payload.id}`),
            meta: {
              // eslint-disable-next-line
              title: `Sign this typed data`,
              raw: payload,
            },
          });
          break;
        case SupportedMethods.decrypt:
          setApprovalData({
            accept: () => {
              console.log(payload);

              debugger;
            },
            reject: () =>
              reject(payload.id, `User rejected decrypt ${payload.id}`),
            meta: {
              // eslint-disable-next-line
              title: `Decrypt`,
              raw: payload,
            },
          });
          break;
        case SupportedMethods.computeSharedSecret:
          setApprovalData({
            accept: () => {
              console.log(payload);
              debugger;
            },
            reject: () =>
              reject(
                payload.id,
                `User rejected computeSharedSecret ${payload.id}`
              ),
            meta: {
              // eslint-disable-next-line
              title: `Compute this shared secret`,
              raw: payload,
            },
          });
          break;
        default:
          reject(payload.id, `${payload.method} not supported!`);
      }
    },
    [personalSign, reject, signTransaction, signTypedData]
  );

  useEffect(() => {
    if (!connector) {
      //   // Rehydration attemps.
      //   window._connector = connector;
      //   let storedValue = null;
      //   try {
      //     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      //     storedValue = JSON.parse(localStorage.getItem(WALLET_ID) as string);
      //     const connector = new WalletConnect(storedValue);
      //     setConnector(connector);

      //     // connector.updateSession({
      //     //   chainId: Alfajores.chainId,
      //     //   accounts: [account.address],
      //     //   networkId: 0,
      //     //   rpcUrl: Alfajores.rpcUrl,
      //     // });
      //   } catch (e) {
      //     // noop
      //   }
      return;
    }

    connector.on(CLIENT_EVENTS.session_request, (error, payload) => {
      if (error) return setError(error.message);

      console.log(CLIENT_EVENTS.session_request, payload);
      setApprovalData({
        accept: approveConnection,
        reject: rejectConnection,
        meta: {
          // eslint-disable-next-line
          title: `new connection from dApp ${payload.params[0].peerMeta.name}`,
          // eslint-disable-next-line
          raw: payload,
        },
      });
    });

    connector.on(CLIENT_EVENTS.connect, (error, payload) => {
      if (error) return setError(error.message);

      console.log(CLIENT_EVENTS.connect, payload);

      connector.on(CLIENT_EVENTS.disconnect, (error, payload) => {
        if (error) return setError(error.message);
        if (!connector) return;

        console.log(CLIENT_EVENTS.disconnect, payload);
        setConnector(null);
        setApprovalData(null);
      });
    });

    connector.on(CLIENT_EVENTS.session_update, (error, payload) => {
      if (error) return setError(error.message);

      console.log(CLIENT_EVENTS.session_update, payload);
    });
    connector.on(CLIENT_EVENTS.wc_sessionRequest, (error, payload) => {
      if (error) return setError(error.message);

      console.log(CLIENT_EVENTS.wc_sessionRequest, payload);
    });
    connector.on(CLIENT_EVENTS.wc_sessionUpdate, (error, payload) => {
      if (error) return setError(error.message);

      console.log(CLIENT_EVENTS.wc_sessionUpdate, payload);
    });

    connector.on(CLIENT_EVENTS.call_request, handleNewRequests);
  }, [
    connector,
    approveConnection,
    handleNewRequests,
    rejectConnection,
    signTransaction,
  ]);

  return (
    <>
      <Head>
        <title>use-contractkit wallet</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="max-w-screen-sm mx-auto py-10 md:py-20 px-4">
        <div className="font-semibold text-2xl">use-contractkit wallet</div>

        <input
          style={{
            padding: 10,
            border: '1px solid #aaa',
            color: connector ? '#777' : '#000',
          }}
          ref={inputRef}
          type="text"
          placeholder={connector ? connector.uri : 'Paste your wc url here...'}
          disabled={!!connector}
        />
        <PrimaryButton
          onClick={() =>
            connector?.session.connected ? rejectConnection() : connect()
          }
        >
          {connector?.session.connected
            ? 'Disconnect'
            : connector
            ? 'Connecting…'
            : 'Connect'}
        </PrimaryButton>
        <div className={error ? '' : 'hidden'}>
          <span className="text-red-500">{error}</span>
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
          <h2>
            Approve: <b>{approvalData?.meta.title}</b> ?
          </h2>
          <pre style={{ fontSize: 8 }}>
            {JSON.stringify(approvalData, null, 2)}
          </pre>
          <div className="flex flex-col md:flex-row md:space-x-4 mb-6">
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
