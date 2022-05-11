import React, { ReactNode } from 'react';
import ReactModal from 'react-modal';

import Spinner from '../components/spinner';
import { useContractKitInternal } from '../use-contractkit';
import { defaultModalStyles } from './styles';

export interface ActionModalProps {
  dappName: string;
  pendingActionCount: number;
}

const defaultActionModalComponent = ({
  dappName,
  pendingActionCount,
}: ActionModalProps) => {
  return (
    <div className="tw-px-5 tw-py-6">
      <div className="tw-text-xl tw-text-center tw-text-slate-800 dark:tw-text-slate-200 tw-mb-4">
        Check your wallet
      </div>
      <p className="tw-text-slate-700 dark:tw-text-slate-400 tw-text-sm tw-text-center">
        {dappName} is trying to{' '}
        {pendingActionCount > 1
          ? `perform ${pendingActionCount} actions`
          : 'perform an action'}
        . Please check your wallet to confirm.
      </p>
      <div className="tw-my-8 tw-flex tw-items-center tw-justify-center">
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
  const { pendingActionCount, dapp } = useContractKitInternal();

  return (
    <ReactModal
      isOpen={pendingActionCount > 0}
      ariaHideApp={false}
      {...(reactModalProps
        ? reactModalProps
        : {
            style: defaultModalStyles,
            overlayClassName:
              'tw-fixed tw-bg-slate-100 dark:tw-bg-slate-700 tw-bg-opacity-75 tw-inset-0',
          })}
    >
      <div className="use-ck tw-max-h-screen">
        <div className="tw-relative tw-bg-white dark:tw-bg-slate-800 tw-w-80 md:tw-w-96">
          {render({ dappName: dapp.name, pendingActionCount })}
        </div>
      </div>
    </ReactModal>
  );
};
