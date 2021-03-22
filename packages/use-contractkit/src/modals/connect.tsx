import { ContractKit } from '@celo/contractkit';
import React, { FunctionComponent, ReactNode, useState } from 'react';
import ReactModal from 'react-modal';
import * as createKit from '../create-kit';
import defaultScreens from '../screens';
import { Provider, SupportedProviders } from '../types';
import { useContractKit } from '../use-contractkit';
import { images } from '../constants';

const providers: Provider[] = [
  {
    name: SupportedProviders.WalletConnect,
    description: 'Scan a QR code to connect your wallet',
    image: images.walletconnect,
  },
  {
    name: SupportedProviders.MetaMask,
    description: 'A crypto gateway to blockchain apps',
    image: images.metamask,
  },
  {
    name: SupportedProviders.Ledger,
    description: 'Connect to your Ledger wallet',
    image: images.ledger,
  },
  {
    name: SupportedProviders.Valora,
    description: 'A mobile payments app that works worldwide',
    image: images.valora,
  },
  {
    name: SupportedProviders.PrivateKey,
    description: 'Enter a plaintext private key to load your account',
    image: (
      <svg
        className="dark:tw-text-gray-300"
        style={{ height: '24px', width: '24px' }}
        aria-hidden="true"
        focusable="false"
        data-prefix="fas"
        data-icon="key"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
      >
        <path
          fill="currentColor"
          d="M512 176.001C512 273.203 433.202 352 336 352c-11.22 0-22.19-1.062-32.827-3.069l-24.012 27.014A23.999 23.999 0 0 1 261.223 384H224v40c0 13.255-10.745 24-24 24h-40v40c0 13.255-10.745 24-24 24H24c-13.255 0-24-10.745-24-24v-78.059c0-6.365 2.529-12.47 7.029-16.971l161.802-161.802C163.108 213.814 160 195.271 160 176 160 78.798 238.797.001 335.999 0 433.488-.001 512 78.511 512 176.001zM336 128c0 26.51 21.49 48 48 48s48-21.49 48-48-21.49-48-48-48-48 21.49-48 48z"
        ></path>
      </svg>
    ),
  },
];

function defaultRenderProvider(provider: Provider & { onClick: () => void }) {
  return (
    <div
      className="tw-flex tw-cursor-pointer tw-py-5 tw-px-4 hover:tw-bg-gray-100 dark:hover:tw-bg-gray-700 tw-transition tw-rounded-md"
      onClick={provider.onClick}
    >
      <div className="tw-flex tw-w-1/4">
        <span className="tw-my-auto">
          {typeof provider.image === 'string' ? (
            <img
              src={provider.image}
              alt={`${provider.name} logo`}
              style={{ height: '48px', width: '48px' }}
            />
          ) : (
            provider.image
          )}
        </span>
      </div>
      <div className="tw-w-3/4">
        <div className="tw-text-lg tw-pb-1 tw-font-medium dark:tw-text-gray-300">
          {provider.name}
        </div>
        <div className="tw-text-sm tw-text-gray-600 dark:tw-text-gray-400">
          {provider.description}
        </div>
      </div>
    </div>
  );
}

export function ConnectModal({
  dappName,
  reactModalProps,
  renderProvider,
  screens,
}: {
  dappName: string;
  screens?: {
    [x in SupportedProviders]: FunctionComponent<{ onSubmit: () => void }>;
  };
  renderProvider?: (p: Provider & { onClick: () => void }) => ReactNode;
  reactModalProps?: Partial<ReactModal.Props>;
}) {
  const { updateKit, network, closeModal, modalIsOpen } = useContractKit();
  const [adding, setAdding] = useState<SupportedProviders | null>(null);

  async function onSubmit(args: any) {
    let kit: ContractKit;
    if (adding === SupportedProviders.PrivateKey) {
      kit = await createKit.fromPrivateKey(network, args);
    } else if (adding === SupportedProviders.Ledger) {
      kit = await createKit.fromLedger(network, args);
    } else if (adding === SupportedProviders.Valora) {
      kit = await createKit.fromDappKit(network, dappName);
    } else if (adding === SupportedProviders.WalletConnect) {
      kit = await createKit.fromWalletConnect(network, args);
    } else if (adding === SupportedProviders.MetaMask) {
      kit = await createKit.fromWeb3(network, args);
    } else {
      throw new Error('Unsupported');
    }

    updateKit(kit);
    setAdding(null);
    closeModal();
  }

  const list = (
    <div>
      {providers.map((p) =>
        (renderProvider || defaultRenderProvider)({
          ...p,
          onClick: () => setAdding(p.name),
        })
      )}
    </div>
  );

  let component;
  if (adding) {
    const ProviderElement = screens?.[adding] || defaultScreens[adding];
    component = <ProviderElement onSubmit={onSubmit} />;
  } else {
    component = list;
  }

  return (
    <ReactModal
      isOpen={modalIsOpen}
      onRequestClose={() => {
        setAdding(null);
        closeModal();
      }}
      {...(reactModalProps
        ? reactModalProps
        : {
            style: {
              content: {
                top: '50%',
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                transform: 'translate(-50%, -50%)',
                border: 'unset',
                background: 'unset',
                padding: 'unset',
              },
            },
            overlayClassName:
              'tw-fixed tw-bg-gray-100 dark:tw-bg-gray-700 tw-bg-opacity-75 tw-inset-0',
          })}
    >
      <div className="use-ck tw-max-h-screen">
        <div className="tw-relative tw-bg-white dark:tw-bg-gray-800 tw-border tw-border-gray-300 dark:tw-border-gray-900 tw-w-80 md:tw-w-96">
          <button
            onClick={closeModal}
            className="tw-absolute tw-top-4 tw-right-4 tw-text-gray-700 dark:tw-text-gray-400 hover:tw-text-gray-800 dark:hover:tw-text-gray-300 hover:tw-bg-gray-100 dark:hover:tw-bg-gray-700 tw-p-3 rounded-full"
          >
            <svg
              className="tw-h-5 tw-w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>{' '}
          </button>
          <div className="tw-rounded-b-lg tw-px-5 tw-py-6">{component}</div>
        </div>
      </div>
    </ReactModal>
  );
}
