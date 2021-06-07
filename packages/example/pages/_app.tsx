import '../styles/global.css';
import '@ubeswap/use-contractkit/lib/styles.css';

import { ContractKitProvider } from '@ubeswap/use-contractkit';
import {
  AppComponent,
  AppProps,
} from 'next/dist/next-server/lib/router/router';
import { Toaster } from 'react-hot-toast';

const MyApp: AppComponent = ({ Component, pageProps }: AppProps) => {
  return (
    <ContractKitProvider
      dapp={{
        name: 'use-contractkit demo',
        description: 'A demo DApp to showcase functionality',
        url: 'https://use-contractkit.vercel.app',
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
