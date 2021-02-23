import React from 'react';
import { useEffect, useState } from 'react';

// import { Client } from '@walletconnect/client';
// import { WalletConnectWallet } from 'contractkit-walletconnect';
import QrCode from 'qrcode.react';
import Loader from 'react-loader-spinner';
import { CopyText } from '../components';

export function WalletConnect({ onSubmit }: { onSubmit: (w: any) => void }) {
  const [uri, setUri] = useState('');

  useEffect(() => {
    async function f() {
      const { WalletConnectWallet } = await import('contractkit-walletconnect');
      const wallet = new WalletConnectWallet({
        connect: {
          metadata: {
            name: 'use-contractkit demo',
            description: 'A showcase of use-contractkit',
            url: 'https://use-contractkit.vercel.app',
            icons: [],
          },
        },
        init: {
          relayProvider: 'wss://bridge.walletconnect.org',
        },
      });
      setUri(await wallet.getUri());
      await wallet.init();
      onSubmit(wallet);
    }
    f();
  }, []);

  return (
    <div style={{ width: '300px' }}>
      {uri ? (
        <div>
          <div
            style={{
              marginBottom: '1em',
              fontSize: '1.1em',
              color: '#6B7280',
            }}
          >
            Scan QR code with a{' '}
            <a
              href="https://walletconnect.org/wallets"
              target="_blank"
              style={{ textDecoration: 'underline' }}
            >
              WalletConnect compatible
            </a>{' '}
            wallet
          </div>
          <QrCode value={uri} size={300} />
          <div
            style={{
              marginTop: '1em',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <CopyText text="Copy to clipboard" payload={uri} />
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Loader type="TailSpin" />
        </div>
      )}
    </div>
  );
}
