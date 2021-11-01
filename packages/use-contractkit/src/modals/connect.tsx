import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useState,
} from 'react';
import ReactModal from 'react-modal';

import { ProviderSelect } from '../components/ProviderSelect';
import { PROVIDERS, SupportedProviders } from '../constants';
import { defaultScreens } from '../screens';
import { Connector, Provider } from '../types';
import { useContractKitInternal } from '../use-contractkit';
import { defaultModalStyles } from './styles';

export interface ConnectModalProps {
  screens?: {
    [x in SupportedProviders]?: FunctionComponent<{
      onSubmit: (connector: Connector) => void;
    }>;
  };
  RenderProvider?: React.FC<{ provider: Provider; onClick: () => void }>;
  reactModalProps?: Partial<ReactModal.Props>;
  denylist?: SupportedProviders[];
}

export const ConnectModal: React.FC<ConnectModalProps> = ({
  reactModalProps,
  RenderProvider = ProviderSelect,
  screens = defaultScreens,
  denylist = [SupportedProviders.ReadOnly],
}: ConnectModalProps) => {
  const { connectionCallback } = useContractKitInternal();
  const [adding, setAdding] = useState<SupportedProviders | null>(null);
  const [showMore, setShowMore] = useState(false);

  const close = useCallback((): void => {
    setAdding(null);
    setShowMore(false);
    connectionCallback?.(false);
  }, [connectionCallback]);

  const onSubmit = useCallback(
    (connector: Connector): void => {
      setAdding(null);
      connectionCallback?.(connector);
    },
    [connectionCallback]
  );

  const onClickShowMore = useCallback(() => {
    setShowMore(true);
  }, []);

  const providers = useMemo<[providerKey: string, provider: Provider][]>(
    () =>
      Object.entries(PROVIDERS).filter(
        ([providerKey, provider]) =>
          typeof window !== 'undefined' &&
          provider.showInList() &&
          Object.keys(screens).find((screen) => screen === provider.name) &&
          // @ts-ignore cant deduce that the keys are from the SupportedProviders enum
          !denylist.includes(providerKey)
      ),
    [screens]
  );
  const prioritizedProviders = useMemo<
    [providerKey: string, provider: Provider][]
  >(
    () => providers.filter(([, provider]) => provider.listPriority() === 0),
    [providers]
  );

  let modalContent;
  if (!adding) {
    const providersToDisplay = showMore ? providers : prioritizedProviders;
    modalContent = (
      <div className="tw-flex tw-flex-col tw-items-stretch">
        <h1 className="tw-pl-3 tw-pb-2 tw-text-lg tw-font-medium dark:tw-text-gray-300">
          Connect a wallet
        </h1>
        {providersToDisplay.map(([providerKey, provider]) => {
          return (
            <RenderProvider
              key={providerKey}
              provider={provider}
              onClick={() => setAdding(providerKey as SupportedProviders)}
            />
          );
        })}
        {!showMore && (
          <button
            onClick={onClickShowMore}
            className="tw-font-medium tw-text-md tw-w-32 tw-self-center tw-mt-4 tw-text-blue-800 dark:tw-text-blue-400 hover:tw-text-blue-600 focus:tw-outline-none"
          >
            Show More
          </button>
        )}
      </div>
    );
  } else {
    const ProviderElement = screens?.[adding];
    if (!ProviderElement) {
      return null;
    }
    modalContent = <ProviderElement onSubmit={onSubmit} />;
  }

  return (
    <ReactModal
      isOpen={!!connectionCallback}
      onRequestClose={close}
      style={defaultModalStyles}
      overlayClassName="tw-fixed tw-bg-gray-100 dark:tw-bg-gray-700 tw-bg-opacity-75 tw-inset-0"
      {...reactModalProps}
    >
      <div className="use-ck tw-bg-white dark:tw-bg-gray-800 tw-p-2">
        <div className="tw-relative use-ck-connect-container">
          <button
            onClick={close}
            className="tw-absolute tw-top-3 tw-right-2 tw-text-gray-700 dark:tw-text-gray-400 hover:tw-text-gray-800 dark:hover:tw-text-gray-300 hover:tw-bg-gray-100 dark:hover:tw-bg-gray-700 tw-p-1 tw-rounded"
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
          <div className="tw-px-4 tw-py-4">{modalContent}</div>
        </div>
      </div>
    </ReactModal>
  );
};
