import React, { useState } from 'react';
import { isMobile } from 'react-device-detect';

import { Provider } from '../types';
import cls from '../utils/tailwind';
import useTheme from '../hooks/use-theme';

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
    tw-will-change-transform
    tw-scale-100
    active:tw-scale-95`,
  rowContainer: `
    tw-flex 
    tw-flex-shrink-0 
    tw-mr-4 
    md:tw-mr-5`,
  iconContainer: `
    tw-my-auto 
    tw-rounded
    tw-p-0.5
    ${isMobile ? 'tw-h-10 tw-w-10' : 'tw-h-7 tw-w-7'}`,
  icon: `
    tw-h-full 
    tw-w-full`,
  name: `
    tw-font-medium 
    tw-text-sm
    tw-antialiased`,
  description: `
    tw-text-sm`,
});

export const ProviderSelect: React.FC<Props> = ({
  provider,
  selected,
  onClick,
}: Props) => {
  const theme = useTheme();
  const [hover, setHover] = useState(false);

  return (
    <button
      className={styles.button}
      style={{
        background: selected ? theme.primary : hover ? theme.muted : '',
        color: selected ? theme.secondary : theme.text,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
    >
      <div className={styles.rowContainer}>
        <span
          className={styles.iconContainer}
          style={{ background: theme.muted }}
        >
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
          className={styles.name}
          style={{
            color: selected ? theme.secondary : theme.text,
          }}
        >
          {provider.name}
        </div>
        {isMobile && (
          <div
            className={styles.description}
            style={{ color: theme.textSecondary }}
          >
            {provider.description}
          </div>
        )}
      </div>
    </button>
  );
};
