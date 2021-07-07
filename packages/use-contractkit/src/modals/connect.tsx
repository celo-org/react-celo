import React, { FunctionComponent, useState } from 'react';
import ReactModal from 'react-modal';

import { ProviderSelect } from '../components/ProviderSelect';
import { PROVIDERS, SupportedProviders } from '../constants';
import { defaultScreens } from '../screens';
import { Connector, Provider } from '../types';
import { useInternalContractKit } from '../use-contractkit';

export interface ConnectModalProps {
  screens?: {
    [x in SupportedProviders]?: FunctionComponent<{
      onSubmit: (connector: Connector) => Promise<void> | void;
    }>;
  };
  RenderProvider?: React.FC<{ provider: Provider; onClick: () => void }>;
  reactModalProps?: Partial<ReactModal.Props>;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({
  reactModalProps,
  RenderProvider = ProviderSelect,
  screens = defaultScreens,
}: ConnectModalProps) => {
  const { connectionCallback } = useInternalContractKit();
  const [adding, setAdding] = useState<SupportedProviders | null>(null);

  const close = () => {
    setAdding(null);
    connectionCallback?.(false);
  };

  function onSubmit(connector: Connector) {
    setAdding(null);
    connectionCallback?.(connector);
  }

  const providers = Object.entries(PROVIDERS).filter(
    ([, provider]) => typeof window !== 'undefined' && provider.showInList()
  );

  const list = (
    <div>
      {Object.keys(screens)
        .map((screen) => ({
          screen,
          provider: providers.find(([name]) => name === screen),
        }))
        .filter(
          (
            ret
          ): ret is {
            screen: string;
            provider: [string, Provider];
          } => ret.provider !== undefined
        )
        .map(({ provider: [providerKey, provider] }) => {
          return (
            <RenderProvider
              key={providerKey}
              provider={provider}
              onClick={() => setAdding(providerKey as SupportedProviders)}
            />
          );
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
};
