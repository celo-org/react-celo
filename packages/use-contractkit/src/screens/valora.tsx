import React, { FunctionComponent, useState } from 'react';

export const Valora: FunctionComponent<any> = ({
  onSubmit,
}: {
  onSubmit: () => void;
}) => {
  return (
    <div className="p-2">
      <div className="text-lg dark:text-gray-200 font-medium">
        Valora Connect
      </div>
      <div className="text-gray-600 dark:text-gray-400 text-sm mt-2">
        By connecting with Valora you'll be redirected to the application and
        asked to verify.
      </div>
      <div className="text-gray-600 dark:text-gray-400 text-sm mt-2">
        Please ensure this is a trusted dApp before proceeding further, you
        won't have a lot of insight into what you're signing so tread with
        caution!.
      </div>
      <button
        className="ml-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 w-full mt-4"
        onClick={() => onSubmit()}
      >
        Connect to Valora
      </button>
    </div>
  );
};
