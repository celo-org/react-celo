import '../styles/global.css';
import { ContractKitProvider } from '@celo-tools/use-contractkit';
import '@celo-tools/use-contractkit/lib/styles.css';
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps }) {
  return (
    <ContractKitProvider
      dappName="use-contractkit demo"
      dappDescription="A demo DApp to showcase functionality"
      dappUrl="https://use-contractkit.vercel.app"
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
      <Component {...pageProps} />
    </ContractKitProvider>
  );
}

export default MyApp;
