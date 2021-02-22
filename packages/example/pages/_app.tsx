import '../styles/global.css';
import { ContractKitProvider } from 'use-contractkit';
import 'use-contractkit/lib/styles.css';

function MyApp({ Component, pageProps }) {
  return (
    <ContractKitProvider dappName="use-contractkit demo">
      <Component {...pageProps} />
    </ContractKitProvider>
  );
}

export default MyApp;
