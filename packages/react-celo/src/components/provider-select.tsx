import React from 'react';
import { isMobile } from 'react-device-detect';

import { Provider } from '../types';
import cls from '../utils/tailwind';

interface Props {
  provider: Provider;
  selected: boolean;
  onClick: () => void;
}

const styles = cls({
  button: `
    tw-flex
    tw-flex-row
    tw-items-center
    tw-text-left
    tw-py-1.5
    tw-pl-2
    tw-pr-2
    ${isMobile ? 'tw-w-full' : 'tw-w-11/12'}
    tw-transition
    tw-rounded-md
    focus:tw-outline-none
    tw-scale-100
    active:tw-scale-95
    hover:tw-bg-slate-100
    dark:hover:tw-bg-slate-700`,
  selectedButton: `
      tw-bg-indigo-500
      hover:tw-bg-indigo-500
      dark:hover:tw-bg-indigo-500
    `,
  rowContainer: `
    tw-flex 
    tw-flex-shrink-0 
    tw-mr-4 
    md:tw-mr-5`,
  iconContainer: `
    tw-my-auto 
    tw-rounded
    tw-p-0.5
    tw-bg-slate-100
    ${isMobile ? 'tw-h-10 tw-w-10' : 'tw-h-7 tw-w-7'}`,
  icon: `
    tw-h-full 
    tw-w-full`,
  name: `
    tw-font-medium 
    tw-text-sm
    tw-antialiased
    dark:tw-text-slate-300`,
  selectedName: `
    tw-text-white
    dark:tw-text-white`,
  description: `
    tw-text-sm 
    tw-text-slate-600 
    dark:tw-text-slate-400`,
});

export const ProviderSelect: React.FC<Props> = ({
  provider,
  selected,
  onClick,
}: Props) => {
  return (
    <button
      className={`${styles.button} ${selected ? styles.selectedButton : ''}`}
      onClick={onClick}
    >
      <div className={styles.rowContainer}>
        <span className={styles.iconContainer}>
          {typeof provider.icon === 'string' ? (
            <img
              src={provider.icon}
              alt={`${provider.name} logo`}
              className={styles.icon}
            />
          ) : (
            <provider.icon className={styles.icon} />
          )}
        </span>
      </div>
      <div>
        <div
          className={`${styles.name} ${selected ? styles.selectedName : ''}`}
        >
          {provider.name}
        </div>
        {isMobile && (
          <div className={styles.description}>{provider.description}</div>
        )}
      </div>
    </button>
  );
};
