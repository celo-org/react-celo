import { useCelo } from '@celo/react-celo';
import React from 'react';

export default function DisconnectButton() {
  const { destroy } = useCelo();

  return (
    <button className="inline underline text-purple-700" onClick={destroy}>
      Disconnect wallet
    </button>
  );
}
