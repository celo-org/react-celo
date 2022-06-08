import '@celo/react-celo/lib/styles.css';
import '../styles/global.css';

import { Alfajores, CeloProvider } from '@celo/react-celo';
import { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps, router }: AppProps): React.ReactElement {
  return (
    <div>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'w-72 md:w-96',
          style: {
            padding: '0px',
          },
        }}
      />

      <div className="max-w-screen-sm mx-auto py-10 md:py-20 px-4">
        <Component {...pageProps} />
      </div>
    </div>
  );
}

export default MyApp;
