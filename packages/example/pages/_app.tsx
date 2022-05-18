import '@celo/react-celo/lib/styles.css';
import '../styles/global.css';

import { Alfajores, CeloProvider } from '@celo/react-celo';
import { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps, router }: AppProps): React.ReactElement {
  if (router.route === '/wallet') {
    return <Component {...pageProps} />;
  }

  return (
    <CeloProvider
      dapp={{
        name: 'react-celo demo',
        description: 'A demo DApp to showcase functionality',
        url: 'https://react-celo.vercel.app',
        icon: 'https://react-celo.vercel.app/favicon.ico',
      }}
      network={Alfajores}
      connectModal={{
        providersOptions: { searchable: true },
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
      <div>
        <Component {...pageProps} />
      </div>
    </CeloProvider>
  );
}

export default MyApp;
