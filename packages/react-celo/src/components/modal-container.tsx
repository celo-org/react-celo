import React from 'react';
import { isMobile } from 'react-device-detect';

import { SupportedProviders } from '../constants';
import { Maybe } from '../types';
import cls from '../utils/tailwind';
import useTheme from '../utils/useTheme';

const styles = cls({
  container: ``,
  innerContainer: `
    tw-relative
    tw-overflow-hidden
    ${isMobile ? 'tw-h-screen' : ''}`,
  closeButton: `
    tw-absolute
    tw-top-5
    ${isMobile ? 'tw-right-2' : 'tw-right-5'}
    hover:tw-opacity-80
    tw-rounded
    tw-z-20`,
  backButton: `
    tw-absolute
    tw-top-5
    ${isMobile ? 'tw-left-2' : 'tw-left-5'}
    hover:tw-opacity-80
    tw-rounded
    tw-z-20`,
  svg: `
    tw-h-5
    tw-w-5
    tw-fill-current`,
  layout: `
    tw-flex
    tw-flex-row
    tw-border-solid
    tw-divide-x
    tw-h-full`,
  trayContainer: `
    tw-flex
    tw-flex-col
    tw-p-4
    tw-h-full
    ${isMobile ? '' : 'tw-basis-3/12'}`,
  contentContainer: `
    tw-flex
    tw-flex-col
    tw-py-4
    tw-px-6
    tw-h-full
    ${isMobile ? 'tw-items-center' : ''}
    ${isMobile ? '' : 'tw-basis-9/12'}`,
});

interface Props {
  selectedProvider: Maybe<SupportedProviders>;
  onClose: () => void;
  onBack: () => void;
  tray: React.ReactElement;
  content: Maybe<React.ReactElement>;
}
export default function ModalContainer({
  onBack,
  onClose,
  selectedProvider,
  tray,
  content,
}: Props) {
  const theme = useTheme();
  let contentToRender = null;

  if (isMobile) {
    if (selectedProvider) {
      contentToRender = <div className={styles.trayContainer}>{content}</div>;
    } else {
      contentToRender = <div className={styles.contentContainer}>{tray}</div>;
    }
  } else {
    contentToRender = (
      <div className={styles.layout}>
        <div className={styles.trayContainer}>{tray}</div>
        <div
          className={styles.contentContainer}
          style={{ borderColor: theme.muted }}
        >
          {content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`react-celo ${styles.container}`}
      style={{ background: theme.background }}
    >
      <div
        className={`react-celo-connect-container ${styles.innerContainer}`}
        style={{ color: theme.textSecondary }}
      >
        <button onClick={onClose} className={styles.closeButton}>
          {/* https://fontawesome.com/icons/xmark?s=solid */}
          <svg
            className={styles.svg}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 320 512"
          >
            <path d="M310.6 361.4c12.5 12.5 12.5 32.75 0 45.25C304.4 412.9 296.2 416 288 416s-16.38-3.125-22.62-9.375L160 301.3L54.63 406.6C48.38 412.9 40.19 416 32 416S15.63 412.9 9.375 406.6c-12.5-12.5-12.5-32.75 0-45.25l105.4-105.4L9.375 150.6c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L160 210.8l105.4-105.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-105.4 105.4L310.6 361.4z" />
          </svg>{' '}
        </button>
        {isMobile && selectedProvider && (
          <button onClick={onBack} className={styles.backButton}>
            {/* https://fontawesome.com/icons/arrow-left-long?s=solid */}
            <svg
              className={styles.svg}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
            >
              <path d="M9.375 233.4l128-128c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25L109.3 224H480c17.69 0 32 14.31 32 32s-14.31 32-32 32H109.3l73.38 73.38c12.5 12.5 12.5 32.75 0 45.25c-12.49 12.49-32.74 12.51-45.25 0l-128-128C-3.125 266.1-3.125 245.9 9.375 233.4z" />
            </svg>{' '}
          </button>
        )}
        {contentToRender}
      </div>
    </div>
  );
}
