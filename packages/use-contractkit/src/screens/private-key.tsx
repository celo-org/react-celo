import React, { useState } from 'react';

export function PrivateKey({
  onSubmit,
}: {
  onSubmit: (privateKey: string) => void;
}) {
  const [value, setValue] = useState('');

  return (
    <div className="w-64 sm:w-96 p-2">
      <div className="flex flex-col">
        <div className="text-xl text-gray-800 dark:text-gray-300">
          Connect with a plaintext private key
        </div>
        <p className="text-sm mt-2 text-gray-600 dark:text-gray-500">
          This will be saved locally in plaintext, be sure to logout before
          leaving this computer unattended.
        </p>
        <div className="flex flex-col">
          <textarea
            className="border border-gray-300 dark:border-gray-700 dark:bg-gray-700 rounded-md mt-3"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <button
            className="mt-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            onClick={() => onSubmit(value)}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
