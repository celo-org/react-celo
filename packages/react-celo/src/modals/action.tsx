import React, { ReactNode } from 'react';
import ReactModal from 'react-modal';

import Spinner from '../components/spinner';
import { useCeloInternal } from '../use-celo';
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
    tw-text-slate-800 dark:
    tw-text-slate-200
    tw-mb-4`,
  dappName: `
      tw-text-indigo-500`,
  actionDescription: `
    tw-text-slate-900
    tw-text-sm
    dark:tw-text-slate-300
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
    tw-bg-white
    dark:tw-bg-slate-800
    tw-w-80
    md:tw-w-96
  `,
});

export interface ActionModalProps {
  dappName: string;
  pendingActionCount: number;
}

const defaultActionModalComponent = ({
  dappName,
  pendingActionCount,
}: ActionModalProps) => {
  return (
    <div className={styles.actionModalContainer}>
      <div className={styles.actionTitle}>Check your wallet</div>
      <p className={styles.actionDescription}>
        <strong>{dappName}</strong> is trying to{' '}
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
  render = defaultActionModalComponent,
}: Props) => {
  const { pendingActionCount, dapp } = useCeloInternal();

  return (
    <ReactModal
      portalClassName={styles.portal}
      isOpen={pendingActionCount > 0}
      ariaHideApp={false}
      {...(reactModalProps
        ? reactModalProps
        : {
            className: styles.modal,
            overlayClassName: styles.overlay,
          })}
    >
      <div className={`use-ck ${styles.contentContainer}`}>
        <div className={styles.content}>
          {render({ dappName: dapp.name, pendingActionCount })}
        </div>
      </div>
    </ReactModal>
  );
};
