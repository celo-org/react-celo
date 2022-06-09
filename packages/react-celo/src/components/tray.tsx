import React, { Fragment, useMemo } from 'react';
import { isMobile } from 'react-device-detect';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { version } from '../../package';
import { Priorities, SupportedProviders } from '../constants';
import useProviders from '../hooks/use-providers';
import useTheme from '../hooks/use-theme';
import { Maybe } from '../types';
import cls from '../utils/tailwind';
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
    tw-pb-2
    tw-text-md
    tw-font-medium
    tw-sticky
    tw-top-0
    tw-z-10
    `,
  verticalContainer: `
    tw-flex
    tw-flex-col
    tw-overflow-hidden
    tw-h-full
    ${isMobile ? 'tw-gap-y-4' : 'tw-gap-y-1'}
    ${isMobile ? 'tw-w-80' : 'tw-w-48'}
    ${isMobile ? 'md:tw-w-96' : 'md:tw-w-64'}`,
  scrollableList: `
    tw-flex
    tw-flex-col
    tw-overflow-y-auto
    tw-overflow-x-hidden
    tw-overscroll-contain
    tw-min-h-full
    tw-pr-1`,
  subtitle: `
    tw-font-medium
    tw-text-sm
    tw-pb-6`,
  flexColumn: `
    tw-flex
    tw-flex-col`,
  columnFooter: `
    tw-flex
    tw-sticky
    ${isMobile ? 'tw-py-4' : 'tw-pt-4'}
    ${isMobile ? '' : 'tw-bottom-0'}
    ${isMobile ? 'tw-justify-center' : 'tw-justify-end'}
    tw-gap-x-2`,
  columnSearchableFooter: `
    tw-justify-between
    `,
  version: `
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
  container: `
    tw-flex-grow`,
  noMatchesSpan: `
    tw-font-normal
    tw-align-center`,
  inputContainer: `
    tw-flex
    tw-self-end`,
  input: `
    tw-text-sm
    tw-font-medium
    placeholder:tw-font-medium
    placeholder:tw-text-current
    placeholder:tw-text-align-end
    focus-visible:tw-outline-none
    `,
  // todo: figure out a way to handle the placeholder color with the theme
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
  const theme = useTheme();

  const nPriorities = providers.reduce((acc, [prio]) => {
    if (!acc.includes(prio)) acc.push(prio);
    return acc;
  }, [] as Priorities[]);

  const searchElem = useMemo(
    () => (
      <div
        className={`${styles.columnFooter} ${
          onSearch ? styles.columnSearchableFooter : ''
        }`}
        style={{
          background: theme.background,
        }}
      >
        {onSearch && (
          <div className={styles.inputContainer}>
            <input
              className={styles.input}
              style={{
                background: theme.background,
                color: theme.textTertiary,
              }}
              placeholder="Search for a wallet"
              value={search || ''}
              onChange={(event) => onSearch(event.target?.value)}
            />
          </div>
        )}
        <span className={styles.version} style={{ color: theme.muted }}>
          {version}
        </span>
      </div>
    ),
    [theme, search, onSearch]
  );

  return (
    <>
      <div className={styles.verticalContainer}>
        <div className={styles.scrollableList}>
          <div
            className={styles.title}
            style={{ color: theme.textSecondary, background: theme.background }}
          >
            <h1>{title}</h1>
            {isMobile && searchElem}
          </div>
          {!providers.length && (
            <div className={styles.noMatchesContainer}>
              <span
                className={styles.noMatchesSpan}
                style={{ color: theme.textTertiary }}
              >
                No matches
              </span>
            </div>
          )}
          {providers.map(([priority, providers]) => (
            <div key={priority} className={styles.container}>
              {!isMobile && nPriorities.length !== 1 && (
                <span
                  className={styles.subtitle}
                  style={{ color: theme.textSecondary }}
                >
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
          {!isMobile && searchElem}
        </div>
      </div>
    </>
  );
}
