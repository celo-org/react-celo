import React, { FunctionComponent, ReactNode, useState } from 'react';
import ReactModal from 'react-modal';
import { images, SupportedProviders } from '../constants';
import { defaultScreens } from '../screens';
import { Connector, Provider } from '../types';
import { useContractKit, useInternalContractKit } from '../use-contractkit';
import { isMobile } from '../utils';

const providers: Provider[] = [
  {
    name: SupportedProviders.Valora,
    description: 'A mobile payments app that works worldwide',
    image: images.Valora,
  },
  {
    name: SupportedProviders.WalletConnect,
    description: 'Scan a QR code to connect your wallet',
    image: images['Wallet Connect'],
  },
];

!isMobile &&
  providers.push(
    {
      name: SupportedProviders.MetaMask,
      description: 'A crypto gateway to blockchain apps',
      image: images['MetaMask'],
    },
    {
      name: SupportedProviders.CeloExtensionWallet,
      description: 'Legacy Celo wallet compatible with Valora',
      image: images['Celo Extension Wallet'],
    },
    {
      name: SupportedProviders.Ledger,
      description: 'Connect to your Ledger wallet',
      image: images.Ledger,
    }
  );

process.env.NODE_ENV !== 'production' &&
  providers.push({
    name: SupportedProviders.PrivateKey,
    description: 'Enter a plaintext private key to load your account',
    image: images[SupportedProviders.PrivateKey],
  });

function defaultRenderProvider(provider: Provider & { onClick: () => void }) {
  return (
    <div
      className="tw-flex tw-cursor-pointer tw-py-5 tw-px-4 hover:tw-bg-gray-100 dark:hover:tw-bg-gray-700 tw-transition tw-rounded-md"
      onClick={provider.onClick}
      key={provider.name.trim()}
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
            <provider.image style={{ height: '48px', width: '48px' }} />
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
  reactModalProps,
  renderProvider = defaultRenderProvider,
  screens = defaultScreens,
}: {
  screens?: {
    [x in SupportedProviders]?: FunctionComponent<{
      onSubmit: (connector: Connector) => Promise<void> | void;
    }>;
  };
  renderProvider?: (p: Provider & { onClick: () => void }) => ReactNode;
  reactModalProps?: Partial<ReactModal.Props>;
}) {
  const { connectionCallback } = useInternalContractKit();
  const [adding, setAdding] = useState<SupportedProviders | null>(null);

  const close = async () => {
    setAdding(null);
    connectionCallback!(false);
  };

  async function onSubmit(connector: Connector) {
    setAdding(null);
    connectionCallback!(connector);
  }

  const list = (
    <div>
      {Object.keys(screens)
        .map((screen) => ({
          screen,
          provider: providers.find((p) => p.name === screen),
        }))
        .filter(
          (
            ret
          ): ret is {
            screen: string;
            provider: Provider;
          } => ret.provider !== undefined
        )
        .map(({ screen, provider }) => {
          return renderProvider({
            ...provider,
            onClick: () => setAdding(provider.name),
          });
        })}
    </div>
  );

  let component;
  if (adding) {
    const ProviderElement = screens?.[adding];
    if (!ProviderElement) {
      return null;
    }
    component = <ProviderElement onSubmit={onSubmit} />;
  } else {
    component = list;
  }

  return (
    <ReactModal
      isOpen={!!connectionCallback}
      onRequestClose={close}
      style={{
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
      }}
      overlayClassName="tw-fixed tw-bg-gray-100 dark:tw-bg-gray-700 tw-bg-opacity-75 tw-inset-0"
      {...reactModalProps}
    >
      <div className="use-ck tw-max-h-screen">
        <div className="tw-relative tw-bg-white dark:tw-bg-gray-800 tw-border tw-border-gray-300 dark:tw-border-gray-900 tw-w-80 md:tw-w-96">
          <button
            onClick={close}
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
