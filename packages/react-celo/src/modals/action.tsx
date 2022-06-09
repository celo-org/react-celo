import React, { ReactNode } from 'react';
import { isMobile } from 'react-device-detect';
import ReactModal from 'react-modal';

import Spinner from '../components/spinner';
import useTheme from '../hooks/use-theme';
import { Theme } from '../types';
import { useCeloInternal } from '../use-celo';
import { hexToRGB } from '../utils/colors';
import cls from '../utils/tailwind';
import { styles as modalStyles } from './connect';

const styles = cls({
  ...modalStyles,
  actionModalContainer: `
    tw-px-5
    tw-py-6`,
  actionTitle: `
    tw-text-xl
    tw-text-center
    tw-mb-4`,
  dappName: ``,
  actionDescription: `
    tw-text-sm
    tw-text-center`,
  actionSpinnerContainer: `
    tw-my-8
    tw-flex
    tw-items-center
    tw-justify-center`,
  contentContainer: `
    tw-max-h-screen
  `,
  content: `
    tw-relative
    tw-w-80
    md:tw-w-96
    ${
      isMobile
        ? `
      tw-flex
      tw-flex-col
      tw-justify-center
      tw-self-center
      tw-h-screen
      tw-mx-auto
    `
        : ''
    }
  `,
});

export interface ActionModalProps {
  dappName: string;
  pendingActionCount: number;
  theme: Theme;
}

const DefaultActionModalComponent = ({
  dappName,
  pendingActionCount,
  theme,
}: ActionModalProps) => {
  return (
    <div className={styles.actionModalContainer} style={{ color: theme.text }}>
      <div className={styles.actionTitle}>Check your wallet</div>
      <p className={styles.actionDescription}>
        <strong style={{ color: theme.primary }}>{dappName}</strong> is trying
        to{' '}
        {pendingActionCount > 1
          ? `perform ${pendingActionCount} actions`
          : 'perform an action'}
        . Please check your wallet to confirm.
      </p>
      <div className={styles.actionSpinnerContainer}>
        <Spinner />
      </div>
    </div>
  );
};

interface Props {
  reactModalProps?: Partial<ReactModal.Props>;
  render?: (props: ActionModalProps) => ReactNode;
}

export const ActionModal: React.FC<Props> = ({
  reactModalProps,
  render = DefaultActionModalComponent,
}: Props) => {
  const theme = useTheme();
  const { pendingActionCount, dapp } = useCeloInternal();

  return (
    <ReactModal
      portalClassName={styles.portal}
      isOpen={pendingActionCount > 0}
      // isOpen
      ariaHideApp={false}
      style={{
        content: {
          background: theme.background,
        },
        overlay: {
          background: hexToRGB(theme.background, 0.8),
        },
      }}
      {...(reactModalProps
        ? reactModalProps
        : {
            className: styles.modal,
            overlayClassName: styles.overlay,
          })}
    >
      <div className={`react-celo ${styles.contentContainer}`}>
        <div className={styles.content}>
          {render({ dappName: dapp.name, pendingActionCount, theme })}
        </div>
      </div>
    </ReactModal>
  );
};
