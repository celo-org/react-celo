import '@celo-tools/use-contractkit/lib/styles.css';
import '../styles/global.css';

import { ContractKitProvider } from '@celo-tools/use-contractkit';
import { AppComponent, AppProps } from 'next/dist/shared/lib/router/router';
import { Toaster } from 'react-hot-toast';

const MyApp: AppComponent = ({ Component, pageProps }: AppProps) => {
  return (
    <ContractKitProvider
      dapp={{
        name: 'use-contractkit demo',
        description: 'A demo DApp to showcase functionality',
        url: 'https://use-contractkit.vercel.app',
        icon: 'https://use-contractkit.vercel.app/favicon.ico',
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
};

export default MyApp;
