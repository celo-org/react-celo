import React, { ReactNode } from 'react';
import Loader from 'react-loader-spinner';
import ReactModal from 'react-modal';
import { useContractKit } from '../use-contractkit';

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
      <div className="tw-text-xl tw-text-gray-800 dark:tw-text-gray-200 tw-mb-2">
        Check your wallet
      </div>
      <p className="tw-text-gray-700 dark:tw-text-gray-400 tw-text-sm tw-mb-6">
        {dappName} is requesting to{' '}
        {pendingActionCount > 1
          ? `perform ${pendingActionCount} actions`
          : 'perform an action'}
        , please check your connected wallet and confirm{' '}
        {pendingActionCount > 1 ? 'these' : 'this'}.
      </p>
      <div className="tw-flex tw-justify-center tw-items-center">
        <Loader type="TailSpin" color="#4f46e5" height={40} width={40} />
      </div>
    </div>
  );
};

export function ActionModal({
  dappName,
  reactModalProps,
  render = defaultActionModalComponent,
}: {
  dappName: string;
  reactModalProps?: Partial<ReactModal.Props>;
  render?: (props: ActionModalProps) => ReactNode;
}) {
  const { pendingActionCount } = useContractKit();
  return (
    <ReactModal
      isOpen={pendingActionCount > 0}
      onRequestClose={() => {
        // setAdding(null);
        // closeModal();
      }}
      {...(reactModalProps
        ? reactModalProps
        : {
            style: {
              content: {
                top: '50%',
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                transform: 'translate(-50%, -50%)',
                border: 'unset',
                background: 'unset',
                padding: 'unset',
              },
            },
            overlayClassName:
              'tw-fixed tw-bg-gray-100 dark:tw-bg-gray-700 tw-bg-opacity-75 tw-inset-0',
          })}
    >
      <div className="use-ck tw-max-h-screen">
        <div className="tw-relative tw-bg-white dark:tw-bg-gray-800 tw-border tw-border-gray-300 dark:tw-border-gray-900 tw-w-80 md:tw-w-96">
          {render({ dappName, pendingActionCount })}
        </div>
      </div>
    </ReactModal>
  );
}
