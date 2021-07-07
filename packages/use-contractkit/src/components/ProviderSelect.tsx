import React from 'react';

import { Provider } from '../types';

interface Props {
  provider: Provider;
  onClick: () => void;
}

export const ProviderSelect: React.FC<Props> = ({
  provider,
  onClick,
}: Props) => {
  return (
    <div
      className="tw-flex tw-cursor-pointer tw-py-5 tw-px-4 hover:tw-bg-gray-100 dark:hover:tw-bg-gray-700 tw-transition tw-rounded-md"
      onClick={
        provider.canConnect()
          ? onClick
          : provider.installURL
          ? () =>
              window.open(provider.installURL, '_blank', 'noopener,noreferrer')
          : undefined
      }
    >
      <div className="tw-flex tw-w-1/4">
        <span className="tw-my-auto">
          {typeof provider.icon === 'string' ? (
            <img
              src={provider.icon}
              alt={`${provider.name} logo`}
              style={{ height: '48px', width: '48px' }}
            />
          ) : (
            <provider.icon style={{ height: '48px', width: '48px' }} />
          )}
        </span>
      </div>
      <div className="tw-w-3/4">
        <div className="tw-text-lg tw-pb-1 tw-font-medium dark:tw-text-gray-300">
          {provider.canConnect() ? provider.name : `Install ${provider.name}`}
        </div>
        <div className="tw-text-sm tw-text-gray-600 dark:tw-text-gray-400">
          {provider.description}
        </div>
      </div>
    </div>
  );
};
