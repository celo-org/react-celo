import { ContractKit } from '@celo/contractkit';
import React, { FunctionComponent, ReactNode, useState } from 'react';
import ReactModal from 'react-modal';
import * as createKit from './create-kit';
import defaultScreens from './screens';
import { Provider, SupportedProviders } from './types';
import { useContractKit } from './use-contractkit';

const providers: Provider[] = [
  {
    name: SupportedProviders.WalletConnect,
    description: 'Scan a QR code to connect your wallet',
    image:
      'https://gblobscdn.gitbook.com/spaces%2F-LJJeCjcLrr53DcT1Ml7%2Favatar.png?alt=media',
  },
  {
    name: SupportedProviders.MetaMask,
    description: 'A crypto gateway to blockchain apps',
    image: 'https://cdn.worldvectorlogo.com/logos/metamask.svg',
  },
  {
    name: SupportedProviders.Ledger,
    description: 'Connect to your Ledger wallet',
    image: 'https://www.ledger.com/wp-content/uploads/2020/02/puce_blue.png',
  },
  {
    name: SupportedProviders.Valora,
    disabled: true,
    image: 'https://valoraapp.com/favicon.ico',
    description: 'A mobile payments app that works worldwide',
  },
  {
    name: SupportedProviders.PrivateKey,
    description: 'Enter a plaintext private key to load your account',
    image: (
      <svg
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
      className="flex cursor-pointer py-5 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition rounded-md"
      onClick={provider.onClick}
    >
      <div className="flex w-1/4">
        <span className="my-auto">
          {typeof provider.image === 'string' ? (
            <img
              src={provider.image}
              alt=""
              style={{ height: '48px', width: '48px' }}
            />
          ) : (
            provider.image
          )}
        </span>
      </div>
      <div className="w-3/4">
        <div className="text-lg pb-1 font-medium dark:text-gray-300">
          {provider.name}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {provider.description}
        </div>
      </div>
    </div>
  );
}

export function Modal({
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
      kit = await createKit.fromLedger(network);
    } else if (adding === SupportedProviders.Valora) {
      kit = await createKit.fromDappKit(network, dappName);
    } else if (adding === SupportedProviders.WalletConnect) {
      kit = await createKit.fromWalletConnect(network, args);
    } else {
      throw new Error('Unsupported');
    }

    updateKit(kit);
    closeModal();
  }

  const list = (
    <div className="">
      {providers.map((p, index) =>
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
    <>
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
            })}
      >
        <div className="use-ck">
          <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-900 px-5 py-3">
            {component}
          </div>
        </div>
      </ReactModal>
    </>
  );
}
