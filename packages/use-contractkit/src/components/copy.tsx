import React, { useCallback, useState } from 'react';

import { useIsMounted } from '../utils/useIsMounted';

interface Props {
  text: string;
  payload: string;
}

export const CopyText: React.FC<Props> = ({ text, payload }: Props) => {
  const [copied, setCopied] = useState(false);
  const isMountedRef = useIsMounted();

  const onClick = useCallback(async () => {
    await navigator.clipboard.writeText(payload);
    setCopied(true);

    setTimeout(() => {
      if (isMountedRef.current) {
        setCopied(false);
      }
    }, 4000);
  }, [payload, isMountedRef]);

  return (
    <button
      onClick={onClick}
      className="tw-flex tw-items-center tw-text-gray-700 dark:tw-text-gray-400 hover:tw-text-gray-500 focus:tw-outline-none"
    >
      <span className="tw-mr-2">{text}</span>
      {copied ? (
        <svg
          className="tw-h-4 tw-w-4 tw-text-green-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        <svg
          className="tw-h-4 tw-w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      )}
    </button>
  );
};
