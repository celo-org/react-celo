import '@celo-tools/use-contractkit/lib/styles.css';
import '../styles/global.css';

import { Alfajores, ContractKitProvider } from '@celo-tools/use-contractkit';
import { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps, router }: AppProps): React.ReactElement {
  if (router.route === '/wallet') {
    return <Component {...pageProps} />;
  }

  return (
    <ContractKitProvider
      dapp={{
        name: 'use-contractkit demo',
        description: 'A demo DApp to showcase functionality',
        url: 'https://use-contractkit.vercel.app',
        icon: 'https://use-contractkit.vercel.app/favicon.ico',
      }}
      network={Alfajores}
      connectModal={{
        title: <span>Connect your DummyWallet</span>,
        providersOptions: {
          // hideFromWCRegistry: [
          //   'd01c7758d741b363e637a817a09bcf579feae4db9f5bb16f599fdd1f66e2f974', // VALORA ID
          // ],
          // hideFromWCRegistry: true,
          // hideFromDefaults: [
          //   'MetaMask',
          //   'Private key',
          //   'Celo Extension Wallet',
          // ],
          // hideFromDefaults: true,
          // sort: (a, b) => a.name.length - b.name.length,
          additionalWCWallets: [
            {
              id: 'dummy-wallet',
              name: 'Dummy Wallet',
              description: 'Lorem ipsum',
              homepage: 'string',
              chains: ['eip:4220'],
              versions: ['1', '2'],
              logos: {
                sm: 'https://via.placeholder.com/40/000000/FFFFFF',
                md: 'https://via.placeholder.com/80/000000/FFFFFF',
                lg: 'https://via.placeholder.com/160/000000/FFFFFF',
              },
              app: {
                browser: 'string',
                ios: 'string',
                android: 'string',
                mac: 'string',
                windows: 'string',
                linux: 'string',
              },
              mobile: {
                native: 'string',
                universal: 'string',
              },
              desktop: {
                native: 'string',
                universal: 'string',
              },
              metadata: {
                shortName: 'string',
                colors: {
                  primary: 'string',
                  secondary: 'string',
                },
              },
              responsive: {
                mobileFriendly: false,
                browserFriendly: true,
                mobileOnly: false,
                browserOnly: true,
              },
            },
          ],
        },
      }}
    >
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'w-72 md:w-96',
          style: {
            padding: '0px',
          },
        }}
      />
      <div suppressHydrationWarning>
        {typeof window === 'undefined' ? null : <Component {...pageProps} />}
      </div>
    </ContractKitProvider>
  );
}

export default MyApp;
