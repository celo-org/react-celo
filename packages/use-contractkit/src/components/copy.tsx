import React from 'react';
import { useCallback, useState } from 'react';

export function CopyText({ text, payload }: { text: string; payload: string }) {
  const [copied, setCopied] = useState(false);

  const onClick = useCallback(async () => {
    await navigator.clipboard.writeText(payload);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 4000);
  }, []);

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        color: '#6B7280',
      }}
    >
      <span style={{ marginRight: '0.5em' }}>{text}</span>
      {copied ? (
        <svg
          style={{ height: '1.5em', width: '1.5em' }}
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
          style={{ height: '1.5em', width: '1.5em' }}
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
}
