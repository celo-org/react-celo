import { useCelo } from '@celo/react-celo';
import React from 'react';

export default function DisconnectButton() {
  const { destroy, address } = useCelo();
  if (!address) {
    return null;
  }
  return (
    <button
      className="inline underline text-rc-violet dark:rc-violet-light"
      onClick={destroy}
    >
      Disconnect wallet
    </button>
  );
}
