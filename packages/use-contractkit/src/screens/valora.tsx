import React, { FunctionComponent, useState } from 'react';

export const Valora: FunctionComponent<any> = ({
  onSubmit,
}: {
  onSubmit: () => void;
}) => {
  return (
    <div className="tw-p-2">
      <div className="tw-text-lg tw-dark:text-gray-200 tw-font-medium">
        Valora Connect
      </div>
      <div className="tw-text-gray-600 dark:tw-text-gray-400 tw-text-sm tw-mt-2">
        By connecting with Valora you'll be redirected to the application and
        asked to verify.
      </div>
      <div className="tw-text-gray-600 dark:tw-text-gray-400 tw-text-sm tw-mt-2">
        Please ensure this is a trusted dApp before proceeding further, you
        won't have a lot of insight into what you're signing so tread with
        caution!.
      </div>
      <button
        className="tw-ml-auto tw-px-4 tw-py-2 tw-border tw-border-transparent tw-rounded-md tw-shadow-sm tw-text-base tw-font-medium tw-text-white tw-bg-gradient-to-r tw-from-purple-600 tw-to-indigo-600 hover:tw-from-purple-700 hover:tw-to-indigo-700 tw-w-full tw-mt-4"
        onClick={() => onSubmit()}
      >
        Connect to Valora
      </button>
    </div>
  );
};
