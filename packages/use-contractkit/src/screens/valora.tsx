import React, { FunctionComponent, useState } from 'react';

export const Valora: FunctionComponent<any> = ({
  onSubmit,
}: {
  onSubmit: () => void;
}) => {
  return (
    <div style={{ paddingLeft: '2em', paddingRight: '2em' }}>
      <button
        className="ml-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        onClick={() => onSubmit()}
      >
        Connect to Valora
      </button>
    </div>
  );
};
