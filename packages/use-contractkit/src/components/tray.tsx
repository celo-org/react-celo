import React from 'react';
import { isMobile } from 'react-device-detect';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { version } from '../../package';
import { Priorities, SupportedProviders } from '../constants';
import { Maybe } from '../types';
import cls from '../utils/tailwind';
import useProviders from '../utils/useProviders';
import { ProviderSelect } from './provider-select';

function priorityToText(priority: Priorities) {
  switch (priority) {
    case Priorities.Recent:
      return 'Recent';
    case Priorities.Popular:
      return 'Popular';
    case Priorities.Default:
    default:
      return 'More';
  }
}

const styles = cls({
  title: `
    ${isMobile ? 'tw-pb-8' : 'tw-pb-2'}
    tw-text-md
    tw-font-medium
    tw-text-slate-900
    dark:tw-text-slate-300`,
  verticalContainer: `
    tw-flex
    tw-flex-col
    tw-overflow-hidden
    tw-flex-grow
    tw-flex-height-full
    tw-justify-between
    ${isMobile ? 'tw-gap-y-4' : 'tw-gap-y-1'}
    ${isMobile ? 'tw-w-80' : 'tw-w-48'}
    ${isMobile ? 'md:tw-w-96' : 'md:tw-w-64'}`,
  scrollableList: `
    tw-flex
    tw-flex-col
    tw-overflow-y-auto
    tw-overflow-x-hidden
    tw-overscroll-contain
    tw-pr-1`,
  subtitle: `
    tw-text-slate-500
    dark:tw-text-slate-300
    tw-font-medium
    tw-text-sm
    tw-pb-6`,
  flexColumn: `
    tw-flex
    tw-flex-col`,
  columnFooter: `
    tw-flex
    ${isMobile ? 'tw-justify-center' : 'tw-justify-end'}
    tw-gap-x-2`,
  columnSearchableFooter: `
    tw-justify-between
    `,
  version: `
    tw-text-slate-200
    dark:tw-text-slate-700
    tw-text-xs
    tw-leading-5
    tw-font-mono
    tw-font-thin
    tw-self-end`,
  noMatchesContainer: `
    tw-h-full
    tw-flex
    tw-flex-col
    tw-items-center
    tw-justify-center`,
  noMatchesSpan: `
    tw-text-slate-500
    tw-font-normal
    tw-align-center`,
  inputContainer: `
    tw-flex
    tw-self-end`,
  input: `
    tw-text-sm
    tw-font-medium
    tw-text-slate-500
    placeholder:tw-font-medium
    placeholder:tw-text-slate-500
    placeholder:tw-text-align-end
    focus-visible:tw-outline-none
    dark:tw-bg-slate-800
  `,
});

interface Props {
  selectedProvider: Maybe<SupportedProviders>;
  providers: ReturnType<typeof useProviders>;
  title: string | React.ReactElement;
  onClickProvider: (providerKey: SupportedProviders) => void;
  search?: string;
  onSearch?: (search: string) => void;
}

export default function Tray({
  providers,
  title,
  onClickProvider,
  selectedProvider,
  search,
  onSearch,
}: Props) {
  const nPriorities = providers.reduce((acc, [prio]) => {
    if (!acc.includes(prio)) acc.push(prio);
    return acc;
  }, [] as Priorities[]);

  return (
    <>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.verticalContainer}>
        {!providers.length && (
          <div className={styles.noMatchesContainer}>
            <span className={styles.noMatchesSpan}>No matches</span>
          </div>
        )}
        <div className={styles.scrollableList}>
          {providers.map(([priority, providers]) => (
            <div key={priority}>
              {!isMobile && nPriorities.length !== 1 && (
                <span className={styles.subtitle}>
                  {priorityToText(priority)}
                </span>
              )}
              <div className={styles.verticalContainer}>
                {providers.map(([providerKey, provider]) => {
                  return (
                    <ProviderSelect
                      key={providerKey}
                      provider={provider}
                      selected={provider.name === selectedProvider}
                      onClick={() =>
                        onClickProvider(providerKey as SupportedProviders)
                      }
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div
          className={`${styles.columnFooter} ${
            onSearch ? styles.columnSearchableFooter : ''
          }`}
        >
          {onSearch && (
            <div className={styles.inputContainer}>
              <input
                className={styles.input}
                placeholder="Search for a wallet"
                value={search || ''}
                onChange={(event) => onSearch(event.target?.value)}
              />
            </div>
          )}
          <span className={styles.version}>{version}</span>
        </div>
      </div>
    </>
  );
}
